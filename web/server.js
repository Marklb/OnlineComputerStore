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

    // Refresh the logged in cookies expiration
    setLoggedInCookie(res, cookie, req.cookies.customerEmail);
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
    var order_direction = 'ASC';
    // var order_direction = 'DESC';
    var order_by = 'P.pname';
    var query_statement = 'SELECT O.pid AS pid, '+
                                 'O.offer_price AS offer_price, '+
                                 'P.ptype AS ptype, '+
                                 'P.pname AS pname, '+
                                 'P.description AS description, '+
                                 'P.pquantity AS pquantity, '+
                                 'C.cpu_type AS cpu_type, '+
                                 'L.btype AS btype, '+
                                 'L.weight AS weight, '+
                                 'PR.printer_type AS printer_type, '+
                                 'PR.resolution AS resolution '+
                          'FROM `OfferProduct` As O '+
                               'INNER JOIN `Product` AS P ON O.pid = P.pid '+
                               'LEFT JOIN `Computer` AS C ON P.pid = C.pid '+
                               'LEFT JOIN `Laptop` AS L ON P.pid = L.pid AND '+
                                                          'C.pid = L.pid '+
                               'LEFT JOIN `Printer` AS PR On O.pid = PR.pid '+
                               'ORDER BY '+order_by+' '+order_direction;
    conn.query(query_statement, defered.makeNodeResolver());
    return defered.promise;
  };
  // Get number of items in cart query
  function doQuery2(){
    var defered = Q.defer();
    var query_statement = 'SELECT COUNT(*) AS `num_items` '+
                          'FROM `Cart` AS C, `AppearsIn` AS A '+
                          'WHERE C.cart_id = A.cart_id AND '+
                                'C.cid = ? AND C.tstatus = 0';
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
  var cid = req.body.cid;
  var pid = req.body.pid;
  var price = req.body.price;
  var quantity_to_add = req.body.quantity_to_add;
  console.log("cid: %s, pid: %s, price: %s, quantity_to_add: %s", cid, pid, price, quantity_to_add);

  // Check if an active cart exists
  var conn = createDBConnection();
  var query_st = 'SELECT `cart_id` '+
                 'FROM `Cart` '+
                 'WHERE `tstatus` = 0 AND `cid` = ?';
  conn.query(query_st, [cid], function(err, rows, fields){
    if (err) throw err;

    console.log(rows);
    if(rows.length > 0){
      // A cart that hasn't completed the transaction exists
      console.log("A cart exists");
      // Check if the product appears in the cart already
      var query_st = 'SELECT * '+
                     'FROM `AppearsIn` '+
                     'WHERE `cart_id` = ? AND `pid` = ?';
      conn.query(query_st, [rows[0].cart_id, pid], function(err2, rows2, fields2){
        if (err2) throw err2;

        if(rows2.length > 0){
          var quantity_in_cart = rows2[0].quantity;
          // Product already appears in the cart
          console.log("Product already in cart");

          // Get the total quantity of that product that exists
          var query_st = 'SELECT `pid`, `pquantity` '+
                         'FROM `Product` '+
                         'WHERE `pid` = ?';
          conn.query(query_st, [pid], function(err3, rows3, fields3){
            if (err3) throw err3;

            var quantity_of_product = rows3[0].pquantity;
            // Update the quantity of the product in the cart and the total
            // product quantity, if the quantity_of_product >= quantity_to_add
            if(quantity_of_product >= quantity_to_add){
              // Update total product quantity
              function doQuery1(){
                var defered = Q.defer();
                var query_st = 'UPDATE `Product` '+
                               'SET `pquantity`= ? '+
                               'WHERE `pid` = ?';
                var values = [(parseInt(quantity_of_product)-parseInt(quantity_to_add)), pid];
                conn.query(query_st, values, defered.makeNodeResolver());
                return defered.promise;
              };

              // Update cart product quantity
              function doQuery2(){
                var defered = Q.defer();
                var query_st = 'UPDATE `AppearsIn` '+
                               'SET `quantity` = ? '+
                               'WHERE `cart_id` = ? AND `pid` = ?';
                var values = [(parseInt(quantity_in_cart)+parseInt(quantity_to_add)), rows[0].cart_id, pid];
                conn.query(query_st, values, defered.makeNodeResolver());
                return defered.promise;
              };

              Q.all([doQuery1(), doQuery2()]).then(function(results){
                conn.end();
              });

            }else{
              // Not enough product available
              // TODO: Show error message to customer
              conn.end();
            }


          });

        }else{
          // Product doesn't appear in the cart yet
          console.log("Product doesn't appear in cart");

          // Insert item into cart
          function doQuery1(){
            var defered = Q.defer();
            var query_st = 'INSERT INTO `AppearsIn` '+
                           '(`cart_id`, `pid`, `quantity`, `price_sold`) '+
                           'VALUES (?, ?, ?, ?)';
            var values = [rows[0].cart_id, pid, quantity_to_add, price];
            conn.query(query_st, values, defered.makeNodeResolver());
            return defered.promise;
          };

          // Remove quantity from product
          function doQuery2(){
            var defered = Q.defer();
            var query_st = 'UPDATE `Product` '+
                           'SET `pquantity` = `pquantity` - ? '+
                           'WHERE `pid` = ?';
            var values = [quantity_to_add, pid];
            conn.query(query_st, values, defered.makeNodeResolver());
            return defered.promise;
          };

          Q.all([doQuery1(), doQuery2()]).then(function(results){
            conn.end();
          });


        }

      });

    }else{
      // A cart that hasn't completed the transaction doesn't exists
      console.log("A cart doesn't exists");
      // Create a cart
      var query_st = 'INSERT INTO `Cart` '+
                     '(`cid`) '+
                     'VALUES (?)';
      conn.query(query_st, [cid], function(err, rows, fields){
        if (err) throw err;

        console.log(rows);
        // Insert product into cart
        function doQuery1(){
          var defered = Q.defer();
          var query_st = 'INSERT INTO `AppearsIn` '+
                         '(`cart_id`, `pid`, `quantity`, `price_sold`) '+
                         'VALUES (?, ?, ?, ?)';
          var values = [rows.insertId, pid, quantity_to_add, price];
          conn.query(query_st, values, defered.makeNodeResolver());
          return defered.promise;
        };

        // Remove quantity from product
        function doQuery2(){
          var defered = Q.defer();
          var query_st = 'UPDATE `Product` '+
                         'SET `pquantity` = `pquantity` - ? '+
                         'WHERE `pid` = ?';
          var values = [quantity_to_add, pid];
          conn.query(query_st, values, defered.makeNodeResolver());
          return defered.promise;
        };

        Q.all([doQuery1(), doQuery2()]).then(function(results){
          conn.end();
        });

      });
    }

    res.redirect('/cart');

  });
});


//==============================================================================
// removeFromCart Route
//==============================================================================
app.post('/removeFromCart', function(req, res){
  // Does not return a view.
  // Removes a product from the customers cart.
  // After adding the product redirect back to the products page or their cart.

  // Read the variables sent using the POST protocol
  var cart_id = req.body.cart_id;
  var cid = req.body.cid;
  var pid = req.body.pid;
  var quantity = req.body.quantity;
  console.log("cart_id: %s cid: %s, pid: %s, quantity: %s", cart_id, cid, pid, quantity);

  var conn = createDBConnection();
  // Delete from customers cart
  function doQuery1(){
    var defered = Q.defer();
    var query_st = 'DELETE FROM `AppearsIn` '+
                   'WHERE `cart_id` = ? AND `pid` = ?';
    var values = [cart_id, pid];
    conn.query(query_st, values, defered.makeNodeResolver());
    return defered.promise;
  };

  // Add quantity back to the product
  function doQuery2(){
    var defered = Q.defer();
    var query_st = 'UPDATE `Product` '+
                   'SET `pquantity` = `pquantity` + ? '+
                   'WHERE `pid` = ?';
    var values = [quantity, pid];
    conn.query(query_st, values, defered.makeNodeResolver());
    return defered.promise;
  };

  Q.all([doQuery1(), doQuery2()]).then(function(results){
    conn.end();
    res.redirect('/cart');
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
                          'FROM `Cart` AS C, `AppearsIn` AS A '+
                          'WHERE C.cart_id = A.cart_id AND '+
                                'C.cid = ? AND C.tstatus = 0';
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
                                 'C.cart_id AS cart_id, '+
                                 'P.ptype AS ptype, P.pname AS pname, '+
                                 'P.description AS description, '+
                                 'A.price_sold AS price_sold, '+
                                 'A.quantity AS quantity_in_cart '+
                          'FROM `Cart` AS C, `AppearsIn` AS A, `Product` AS P '+
                          'WHERE C.cid = (SELECT `cid` '+
                                         'FROM `Customer` '+
                                         'WHERE `email` = ?) '+
                          'AND C.cart_id = A.cart_id AND P.pid = A.pid '+
                          'AND `tstatus` = 0';
    conn.query(query_statement, [customer_email], defered.makeNodeResolver());
    return defered.promise;
  };
  // Get number of items in cart query
  function doQuery2(){
    var defered = Q.defer();
    var query_statement = 'SELECT COUNT(*) AS `num_items` '+
                          'FROM `Cart` AS C, `AppearsIn` AS A '+
                          'WHERE C.cart_id = A.cart_id AND '+
                                'C.cid = ? AND C.tstatus = 0';
    conn.query(query_statement, [customer_cid], defered.makeNodeResolver());
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
// transaction history page
//==============================================================================
app.get('/transaction_history', function(req, res){
  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  var conn = createDBConnection();
  // Get all the products in completed carts for customer query
  function doQuery1(){
    var defered = Q.defer();
    var query_statement = 'SELECT C.cid AS cid, A.pid AS pid, '+
                                 'C.cart_id AS cart_id, '+
                                 'P.ptype AS ptype, P.pname AS pname, '+
                                 'P.description AS description, '+
                                 'A.price_sold AS price_sold, '+
                                 'A.quantity AS quantity_in_cart '+
                          'FROM `Cart` AS C, `AppearsIn` AS A, `Product` AS P '+
                          'WHERE C.cid = ? '+
                          'AND C.cart_id = A.cart_id AND P.pid = A.pid '+
                          'AND `tstatus` > 0';
    conn.query(query_statement, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };
  // Get number of items in cart query
  function doQuery2(){
    var defered = Q.defer();
    var query_statement = 'SELECT COUNT(*) AS `num_items` '+
                          'FROM `Cart` AS C, `AppearsIn` AS A '+
                          'WHERE C.cart_id = A.cart_id AND '+
                                'C.cid = ? AND C.tstatus = 0';
    conn.query(query_statement, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };

  Q.all([doQuery1(), doQuery2()]).then(function(results){
    conn.end();

    res.render('pages/transaction_history', {
      isLoggedIn: loggedIn,
      cid: customer_cid,
      email: customer_email,
      itemsInCart: results[1][0][0].num_items,
      transactionsData: results[0][0]
    });
  });
});


//==============================================================================
// create customer page
//==============================================================================
app.get('/create_customer', function(req, res){
  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  // Render the new customer view which contains the new customer form.
  res.render('pages/create_customer', {
    isLoggedIn: loggedIn,
    cid: customer_cid,
    email: customer_email
  });
});

app.post('/create_customer', function(req, res){
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var address = req.body.address;
  var phone = req.body.phone;

  var conn = createDBConnection();
  var query_statement = 'INSERT INTO `Customer` '+
                        '(`fname`, `lname`, `email`, `address`, `phone`) '+
                        'VALUES (?, ?, ?, ?, ?) ';
  var values = [fname, lname, email, address, phone];
  conn.query(query_statement, values, function(err, rows, fields){
    conn.end();
    if(err){
      console.log(err);
      res.redirect('/create_customer');
    }else{
      res.redirect('/login');
    }
  });

});


//==============================================================================
// new credit card page
//==============================================================================
app.get('/new_credit_card', function(req, res){
  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  var conn = createDBConnection();
  // Get number of items in cart query
  function doQuery1(){
    var defered = Q.defer();
    var query_statement = 'SELECT COUNT(*) AS `num_items` '+
                          'FROM `Cart` AS C, `AppearsIn` AS A '+
                          'WHERE C.cart_id = A.cart_id AND '+
                                'C.cid = ? AND C.tstatus = 0';
    conn.query(query_statement, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };

  Q.all([doQuery1()]).then(function(results){
    console.log(results[0][0]);
    var num_items_in_cart = results[0][0][0].num_items;
    console.log(num_items_in_cart);

      // Render the new credit card view which contains the new credit card form.
      res.render('pages/new_credit_card', {
        isLoggedIn: loggedIn,
        cid: customer_cid,
        email: customer_email,
        itemsInCart: num_items_in_cart
      });
    });

});

app.post('/new_credit_card', function(req, res){
  var cid = req.body.cid;
  var ccnumber = req.body.ccnumber;
  var sec_number = req.body.sec_number;
  var owner_name = req.body.owner_name;
  var cctype = req.body.cctype;
  var address = req.body.address;
  var exp_date = req.body.exp_date.split('/');

  console.log(cid);
  console.log(ccnumber);
  console.log(sec_number);
  console.log(owner_name);
  console.log(cctype);
  console.log(address);
  console.log(exp_date);

  var conn = createDBConnection();
  var query_statement = 'INSERT INTO `CreditCard` '+
                        '(`ccnumber`, `sec_number`, `owner_name`, `cctype`, `ccaddress`, `exp_date`) '+
                        'VALUES (?, ?, ?, ?, ?, ?)';
  var values = [ccnumber, sec_number, owner_name, cctype, address, exp_date[1]+'-01-'+exp_date[0]];
  conn.query(query_statement, values, function(err, rows, fields){
    if(err){
      console.log(err);
      res.redirect('/account');
    }else{
      var query_statement = 'INSERT INTO `StoredCard` '+
                            '(`ccnumber`, `cid`) '+
                            'VALUES (?, ?)';
      var values = [parseInt(ccnumber), cid];
      conn.query(query_statement, values, function(err, rows, fields){
        conn.end();
        res.redirect('/account');
      });
    }
  });

});


//==============================================================================
// new shipping address page
//==============================================================================
app.get('/new_shipping_address', function(req, res){
  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  var conn = createDBConnection();
  // Get number of items in cart query
  function doQuery1(){
    var defered = Q.defer();
    var query_statement = 'SELECT COUNT(*) AS `num_items` '+
                          'FROM `Cart` AS C, `AppearsIn` AS A '+
                          'WHERE C.cart_id = A.cart_id AND '+
                                'C.cid = ? AND C.tstatus = 0';
    conn.query(query_statement, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };

  Q.all([doQuery1()]).then(function(results){
    console.log(results[0][0]);
    var num_items_in_cart = results[0][0][0].num_items;
    console.log(num_items_in_cart);

      // Render the new shipping address view
      res.render('pages/new_shipping_address', {
        isLoggedIn: loggedIn,
        cid: customer_cid,
        email: customer_email,
        itemsInCart: num_items_in_cart
      });
    });

});

app.post('/new_shipping_address', function(req, res){
  var cid = req.body.cid;
  var sa_name = req.body.sa_name;
  var recepient_name = req.body.recepient_name;
  var street = req.body.street;
  var snumber = req.body.snumber;
  var city = req.body.city;
  var zip = req.body.zip;
  var state = req.body.state;
  var country = req.body.country;

  console.log(cid);
  console.log(sa_name);
  console.log(recepient_name);
  console.log(street);
  console.log(snumber);
  console.log(city);
  console.log(zip);
  console.log(state);
  console.log(country);

  var conn = createDBConnection();
  var query_statement = 'INSERT INTO `ShippingAddress` '+
                        '(`cid`, `sa_name`, `recepient_name`, `street`, '+
                         '`snumber`, `city`, `zip`, `state`, `country`) '+
                        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  var values = [cid, sa_name, recepient_name, street, snumber, city, zip, state,
                country];
  conn.query(query_statement, values, function(err, rows, fields){
    if (err) throw err;

    conn.end();
    res.redirect('/account');
  });

});


//==============================================================================
// complete transaction page
//==============================================================================
app.get('/complete_transaction', function(req, res){
  // Standard vars needed for each page.
  var loggedIn = isLoggedIn(req, res);
  var customer_cid = loggedIn ? getCidCookie(req) : "";
  var customer_email = loggedIn ? getEmailCookie(req) : "";

  var conn = createDBConnection();
  // Get number of items in cart query
  function doQuery1(){
    var defered = Q.defer();
    var query_statement = 'SELECT COUNT(*) AS `num_items` '+
                          'FROM `Cart` AS C, `AppearsIn` AS A '+
                          'WHERE C.cart_id = A.cart_id AND '+
                                'C.cid = ? AND C.tstatus = 0';
    conn.query(query_statement, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };

  // Get all the products in cart for customer query
  function doQuery2(){
    var defered = Q.defer();
    var query_statement = 'SELECT C.cid AS cid, A.pid AS pid, '+
                                 'C.cart_id AS cart_id, '+
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
    conn.query(query_st, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };

  // Get shipping addresses query
  function doQuery4(){
    var defered = Q.defer();
    var query_st = 'SELECT * FROM `ShippingAddress` WHERE `cid` = ?';
    conn.query(query_st, [customer_cid], defered.makeNodeResolver());
    return defered.promise;
  };

  Q.all([doQuery1(), doQuery2(), doQuery3(), doQuery4()]).then(function(results){
    var num_items_in_cart = results[0][0][0].num_items;
    var cart_data = results[1][0];
    var stored_cards_data = results[2][0];
    var stored_shipping_addresses_data = results[3][0];

      // Render the complete transaction view
      res.render('pages/complete_transaction', {
        isLoggedIn: loggedIn,
        cid: customer_cid,
        email: customer_email,
        itemsInCart: num_items_in_cart,
        cartData: cart_data,
        storedCards: stored_cards_data,
        storedShippingAddressesData: stored_shipping_addresses_data
      });
    });

});

app.post('/complete_transaction', function(req, res){
  var cid = req.body.cid;
  var cart_id = req.body.cart_id;
  var ccnumber = req.body.ccnumber;
  var sa_name = req.body.sa_name;

  var conn = createDBConnection();
  var query_statement = 'UPDATE `Cart` '+
                        'SET `sa_name` = ?, `ccnumber` = ?, '+
                            '`tstatus` = 1, `tdate` = now() '+
                        'WHERE `cart_id` = ? AND `cid` = ?';
  var values = [sa_name, ccnumber, cart_id, cid];
  conn.query(query_statement, values, function(err, rows, fields){
    if (err) throw err;

    conn.end();
    res.redirect('/account');
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
