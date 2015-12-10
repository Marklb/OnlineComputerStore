// server.js
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var Q = require('q');
var app = express();

// Use ejs template engine
app.set('view engine', 'ejs');
// Use cookie-parser plugin to easily handle cookies
app.use(cookieParser());
// Use body-parser plugin to easily read post request data
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


// Set any directory with resources (css, js, imgs, etc) as a static directory
// Anything in a static directory can be requested without needing a route.
// When setting the path to the file just treat each of the static directories
// as the root directory.
// Example to include styles.css which would normally be requested in an html
// file as 'public/styles.css':
//    <link rel="stylesheet" type="text/css" href="styles.css">
// 'public/' isn't needed because 'public/' is a static directory
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/node_modules/jquery/dist'));


//==============================================================================
// MySQL
//==============================================================================
function createDBConnection(){
  // Creates a connection to the MySQL db and returns the connection object.
  // Refer to the nodejs plugin 'mysql' for the functions that can be used on
  // the returned connection object.
  // The connection object returned by this function is how you interact with
  // the MySQL database.
  // Close the connection to the database by calling the function end() on the
  // connection object returned by this function.
  return mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'OnlineComputerStore'
  });
};


//==============================================================================
// Login handling based on stored cookie
//==============================================================================
function isLoggedIn(req, res){
  // Currently there is no server side session setup, so if the customer has
  // a customerCID cookie set then they are considered logged in as the
  // customer with the cid equal to the cid set in the customerCID cookie.
  var cookie = req.cookies.customerCID;
  if (cookie === undefined){
    // Customer is not logged in
    return false;
  }else{
    // Customer is logged in
    return true;
  }
};
function setLoggedInCookie(res, cid, email){
  // customerCID is the main cookie that needs to be set.
  // customerEmail is only being set so that the users email can be shown in
  // the top navbar of each page without needing to query the db again.
  // Once a proper login system is setup the customerEmail cookie shouldn't be
  // needed anymore.
  res.cookie('customerCID', cid, { maxAge: 900000, httpOnly: true });
  res.cookie('customerEmail', email, { maxAge: 900000, httpOnly: true });
};
function deleteLoggedInCookie(res){
  // Since the customer is currently considered logged in if the customerCID
  // coookie is set, you can log the customer out by clearing or expiring the
  // cookie.
  res.clearCookie('customerCID');
  res.clearCookie('customerEmail');
};
function getCidCookie(req){
  // Just a getter function to get the customerCID.
  // I do this so that I can add a better way of getting the cid later without
  // changing each place in the code where I requested the cid.
  return req.cookies.customerCID;
};
function getEmailCookie(req){
  // Just a getter function to get the customerEmail.
  // I do this so that I can add a better way of getting the email later without
  // changing each place in the code where I requested the email.
  return req.cookies.customerEmail;
};


//==============================================================================
// home page
//==============================================================================
function GET_homeRoute(req, res){
  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  var conn = createDBConnection();
  // Get all the products offered query
  function doQuery1(){
    var defered = Q.defer();
    var query_statement = 'SELECT O.pid AS pid, '+
                                 'O.offer_price AS offer_price, '+
                                 'P.ptype AS ptype, '+
                                 'P.pname AS pname, '+
                                 'P.description AS description, '+
                                 'P.pquantity AS pquantity '+
                          'FROM `OfferProduct` As O, `Product` AS P '+
                          'WHERE O.pid = P.pid';
    conn.query(query_statement, defered.makeNodeResolver());
    return defered.promise;
  };
  // Get number of items in cart query
  function doQuery2(){
    var defered = Q.defer();
    var query_statement = 'SELECT COUNT(*) AS `num_items` '+
                          'FROM `Cart` '+
                          'WHERE `cid` IN (SELECT `cid` '+
                                          'FROM `Customer` '+
                                          'WHERE `cid` = ?)';
    conn.query(query_statement, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };

  Q.all([doQuery1(), doQuery2()]).then(function(results){
    conn.end();
    res.render('pages/home', {
      isLoggedIn: loggedIn,
      cid: customer_cid,
      email: customer_email,
      products: results[0][0],
      itemsInCart: results[1][0][0].num_items
    });
  })
};
app.get('/', GET_homeRoute);
app.get('/index', GET_homeRoute);
app.get('/home', GET_homeRoute);


//==============================================================================
// addToCart Route
//==============================================================================
app.post('/addToCart', function(req, res){
  // Does not return a view.
  // Adds a product to the customers cart.
  // After adding the product redirect back to the products page or their cart.

  // Read the variables sent using the POST protocol
  var email = req.body.cid;
  var email = req.body.pid;
  var email = req.body.price;

  // Check if an active cart exists
  var conn = createDBConnection();
  var query_statement = 'SELECT `cart_id` FROM `Cart` WHERE ';
  conn.query(query_statement, [email], function(err, rows, fields){
    if (err) throw err;
    conn.end();

    console.log(rows);
    // TODO: Finish this functions implementation.

  });
});


//==============================================================================
// login page
//==============================================================================
app.get('/login', function(req, res){
  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  // Render the login view which contains the login form.
  // IDEA: If already logged in, rediect to home page or display on the page
  //       that the customer is already logged in.
  res.render('pages/login', {
    isLoggedIn: loggedIn,
    cid: customer_cid,
    email: customer_email
  });
});

app.post('/login', function(req, res){
  // Read the variables sent using the POST protocol
  var email = req.body.email;

  // Check if the user exists
  // TODO: Add a password instead of just letting a customer log in if they
  //       provide an email that exists.
  var conn = createDBConnection();
  var query_statement = 'SELECT `cid`, `email` '+
                        'FROM `Customer` '+
                        'WHERE `email` = ?';
  conn.query(query_statement, [email], function(err, rows, fields){
    if (err) throw err;

    conn.end();
    if(rows.length > 0){
      // A record was found for the email
      setLoggedInCookie(res, rows[0].cid, email);
      res.redirect('/');
    }else{
      // No record was found for the email
      res.redirect('/login');
    }
  });
});


//==============================================================================
// logout route
//==============================================================================
app.get('/logout', function(req, res){
  // Does not return a view.
  // Instead the customer is logged out, then redirected back to the home page.

  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  if(loggedIn){
    deleteLoggedInCookie(res);
  }else{
    // TODO: Display error that customer is not logged in
  }
  res.redirect('/');

});


//==============================================================================
// account page
//==============================================================================
app.get('/account', function(req, res){
  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  var conn = createDBConnection();
  // Get number of items in cart query
  function doQuery1(){
    var defered = Q.defer();
    var query_statement = 'SELECT COUNT(*) AS `num_items` '+
                          'FROM `Cart` WHERE `cid` IN (SELECT `cid` '+
                                                      'FROM `Customer` '+
                                                      'WHERE `cid` = ?)';
    conn.query(query_statement, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };

  // Get customer info query
  function doQuery2(){
    var defered = Q.defer();
    var query_statement = 'SELECT C.cid AS cid, C.fname AS fname, '+
                                 'C.lname AS lname, C.email AS email, '+
                                 'C.address AS address, C.phone AS phone, '+
                                 'C.status AS status, '+
                                 'S.credit_line AS credit_line '+
                          'FROM `Customer` AS C '+
                                'LEFT JOIN `SilverAndAbove` AS S '+
                                'ON C.cid = S.cid '+
                          'WHERE C.cid = ?';
    conn.query(query_statement, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };

  Q.all([doQuery1(), doQuery2()]).then(function(results){
    var num_items_in_cart = results[0][0][0].num_items;
    var customer_info = results[1][0][0];

    // Get credit cards stored query
    function doQuery3(){
      var defered = Q.defer();
      var query_st = 'SELECT S.cid AS cid, '+
                            'C.ccnumber AS ccnumber, '+
                            'C.sec_number AS sec_number, '+
                            'C.owner_name AS owner_name, '+
                            'C.cctype AS cctype, '+
                            'C.ccaddress AS ccaddress, '+
                            'C.exp_date AS exp_date '+
                      'FROM `StoredCard` AS S, `CreditCard` AS C '+
                      'WHERE C.ccnumber = S.ccnumber AND S.cid = ?';
      conn.query(query_st, [customer_info.cid], defered.makeNodeResolver());
      return defered.promise;
    };

    // Get shipping addresses query
    function doQuery4(){
      var defered = Q.defer();
      var query_st = 'SELECT * FROM `ShippingAddress` WHERE `cid` = ?';
      conn.query(query_st, [customer_info.cid], defered.makeNodeResolver());
      return defered.promise;
    };

    Q.all([doQuery3(), doQuery4()]).then(function(results2){
      conn.end();
      var stored_cards = results2[0][0];
      var shipping_addresses = results2[1][0];

      res.render('pages/account', {
        isLoggedIn: loggedIn,
        cid: customer_cid,
        email: customer_email,
        itemsInCart: num_items_in_cart,
        customerInfo: customer_info,
        storedCards: stored_cards,
        shippingAddresses: shipping_addresses
      });
    });
  });


});


//==============================================================================
// cart page
//==============================================================================
app.get('/cart', function(req, res){
  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  var conn = createDBConnection();
  // Get all the products in cart for customer query
  function doQuery1(){
    var defered = Q.defer();
    var query_statement = 'SELECT C.cid AS cid, A.pid AS pid, '+
                                 'P.ptype AS ptype, P.pname AS pname, '+
                                 'P.description AS description, '+
                                 'A.price_sold AS price_sold, '+
                                 'A.quantity AS quantity_in_cart '+
                          'FROM `Cart` AS C, `AppearsIn` AS A, `Product` AS P '+
                          'WHERE C.cid = (SELECT `cid` '+
                                         'FROM `Customer` '+
                                         'WHERE `email` = ?) '+
                          'AND C.cart_id = A.cart_id AND P.pid = A.pid';
    conn.query(query_statement, [customer_email], defered.makeNodeResolver());
    return defered.promise;
  };
  // Get number of items in cart query
  function doQuery2(){
    var defered = Q.defer();
    var query_statement = 'SELECT COUNT(*) AS `num_items` '+
                          'FROM `Cart` '+
                          'WHERE `cid` IN (SELECT `cid` '+
                                          'FROM `Customer` '+
                                          'WHERE `email` = ?)';
    conn.query(query_statement, [customer_email], defered.makeNodeResolver());
    return defered.promise;
  };

  Q.all([doQuery1(), doQuery2()]).then(function(results){
    conn.end();

    res.render('pages/cart', {
      isLoggedIn: loggedIn,
      cid: customer_cid,
      email: customer_email,
      itemsInCart: results[1][0][0].num_items,
      cartData: results[0][0]
    });
  });
});








//==============================================================================
// Server start
//==============================================================================
var server = app.listen(3050, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server Listening at: http://%s:%s", host, port);
});
