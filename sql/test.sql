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
