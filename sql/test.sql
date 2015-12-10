USE OnlineComputerStore;

SELECT C.fname, C.lname, C.email, C.address, C.phone, C.status, S.credit_line
FROM `Customer` AS C, `SilverAndAbove` AS S
WHERE C.cid = S.cid;




-- Get account info
SELECT C.cid AS cid, C.fname AS fname,
       C.lname AS lname, C.email AS email,
       C.address AS address, C.phone AS phone,
       C.status AS status,
       S.credit_line AS credit_line
FROM `Customer` AS C
      LEFT JOIN `SilverAndAbove` AS S
      ON C.cid = S.cid
WHERE C.email = 'bsmith@email.com';

-- Get credit cards stored
SELECT S.cid, C.ccnumber, C.sec_number, C.owner_name, C.cctype, C.ccaddress, C.exp_date
FROM `StoredCard` AS S, `CreditCard` AS C
WHERE C.ccnumber = S.ccnumber AND S.cid = 1;

-- Get Shipping addresses
SELECT * FROM `ShippingAddress` WHERE `cid` = 1;

-- Num items in cart
SELECT COUNT(*) AS `num_items`
FROM `Cart` AS C, `AppearsIn` AS A
WHERE C.cart_id = A.cart_id AND
      C.cid = 2 AND C.tstatus = 0;



-- Products
SELECT O.pid AS pid,
       O.offer_price AS offer_price,
       P.ptype AS ptype,
       P.pname AS pname,
       P.description AS description,
       P.pquantity AS pquantity,
       C.cpu_type AS cpu_type,
       L.btype AS btype,
       L.weight AS weight,
       PR.printer_type AS printer_type,
       PR.resolution AS resolution
FROM `OfferProduct` As O
     INNER JOIN `Product` AS P ON O.pid = P.pid
     LEFT JOIN `Computer` AS C ON P.pid = C.pid
     LEFT JOIN `Laptop` AS L ON P.pid = L.pid AND C.pid = L.pid
     LEFT JOIN `Printer` AS PR On O.pid = PR.pid
     ORDER BY P.pname;

--
SELECT `pquantity` FROM `Product` WHERE `pid` = 1;

--
UPDATE `Product`
SET `pquantity` = `pquantity` + 5
WHERE `pid` = 1;


--
DELETE FROM `AppearsIn` '+
WHERE `cart_id` = 2 AND `pid` = 5
