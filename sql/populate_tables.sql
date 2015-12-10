USE OnlineComputerStore;
-- Customer
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Bob", "Smith", "bsmith@email.com", "6th Street", "1-555-3654", 1); -- 1
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Joe", "Stanton", "jstanton@email.com", "34th Ave", "1-555-7544", 1); -- 2
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Alice", "Smith", "asmith@email.com", "9th Road", "1-555-8366", 1); -- 3
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Alex", "Tally", "atally@email.com", "7th Street", "1-555-3567", 1); -- 4
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Ben", "Blount", "bblount@email.com", "1st Street", "1-555-4537", 1); -- 5
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Steve", "Jefferson", "sJeff@email.com", "1st Street", "1-555-3456", 1); -- 6
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Max", "Swan", "mswan@email.com", "8th Road", "1-555-1946", 1); -- 7
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Sue", "Steel", "ssteel@email.com", "12th Ave", "1-555-8275", 1); -- 8
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Joe", "Hetzel", "jhetzel@email.com", "1st Ave", "1-555-2576", 1); -- 9
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Moe", "Ellis", "mell@email.com", "89th Ave", "1-555-3457", 1); -- 10
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Sam", "Iverson", "siver@email.com", "4th Bulivard", "1-555-7688", 1); -- 11
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Rick", "Milton", "rmilt@email.com", "9th Road", "1-555-5555", 1); -- 12
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Percy", "Stanton", "pstant@email.com", "3345 Village", "1-555-3333", 1); -- 13
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Austin", "Nixon", "anixon@email.com", "353 Village", "1-555-3466", 1); -- 14
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("George", "Steton", "gstet@email.com", "32th Ave", "1-555-8855", 1); -- 15
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Justin", "Wilson", "jwils@email.com", "9th Street", "1-555-8854", 1); -- 16
INSERT INTO Customer (fname, lname, email, address, phone, status) VALUES ("Alexis", "Ford", "aford@email.com", "12th Road", "1-555-8899", 1); -- 17

-- SilverAndAbove
INSERT INTO SilverAndAbove (cid, credit_line) VALUES (1, "Something");
INSERT INTO SilverAndAbove (cid, credit_line) VALUES (4, "Something1");
INSERT INTO SilverAndAbove (cid, credit_line) VALUES (8, "Something");
INSERT INTO SilverAndAbove (cid, credit_line) VALUES (9, "Something2");

-- CreditCard
INSERT INTO CreditCard (ccnumber, sec_number, owner_name, cctype, ccaddress, exp_date) VALUES (5555678834678375, 234, "Joe L Stanton", "Mastercard", "34th Ave", "2017-01-01");
INSERT INTO CreditCard (ccnumber, sec_number, owner_name, cctype, ccaddress, exp_date) VALUES (5555654645673783, 345, "Ben H Blount", "Visa", "1st Street", "2016-06-01");
INSERT INTO CreditCard (ccnumber, sec_number, owner_name, cctype, ccaddress, exp_date) VALUES (5555677547884663, 466, "Steve K Jefferson", "Visa", "1st Street", "2018-01-01");
INSERT INTO CreditCard (ccnumber, sec_number, owner_name, cctype, ccaddress, exp_date) VALUES (5555454745774578, 567, "Sue B Steel", "Mastercard", "12th Ave", "2017-01-01");
INSERT INTO CreditCard (ccnumber, sec_number, owner_name, cctype, ccaddress, exp_date) VALUES (5555453748573857, 687, "Joe L Hetzel", "Visa", "1st Ave", "2016-03-01");
INSERT INTO CreditCard (ccnumber, sec_number, owner_name, cctype, ccaddress, exp_date) VALUES (5555478348844845, 789, "Moe S Ellis", "Mastercard", "89th Ave", "2017-04-01");

-- StoredCard
INSERT INTO StoredCard (ccnumber, cid) VALUES (5555678834678375, 2);
INSERT INTO StoredCard (ccnumber, cid) VALUES (5555654645673783, 5);
INSERT INTO StoredCard (ccnumber, cid) VALUES (5555677547884663, 6);
INSERT INTO StoredCard (ccnumber, cid) VALUES (5555454745774578, 8);
INSERT INTO StoredCard (ccnumber, cid) VALUES (5555453748573857, 9);
INSERT INTO StoredCard (ccnumber, cid) VALUES (5555478348844845, 10);

-- ShippingAddress
INSERT INTO ShippingAddress (cid, sa_name, recepient_name, street, snumber, city, zip, state, country) VALUES (2, "Home", "Joe Stanton", "43th Ave", 43, "Newark", 07107, "NJ", "United States");
INSERT INTO ShippingAddress (cid, sa_name, recepient_name, street, snumber, city, zip, state, country) VALUES (2, "Appartment", "Joe Stanton", "543 Street", 543, "Arlington", 38002, "TN", "United States");
INSERT INTO ShippingAddress (cid, sa_name, recepient_name, street, snumber, city, zip, state, country) VALUES (5, "Home", "Ben Blount", "1st Street", 1, "Newark", 07107, "NJ", "United States");
INSERT INTO ShippingAddress (cid, sa_name, recepient_name, street, snumber, city, zip, state, country) VALUES (6, "Home", "Steve Jefferson", "1st Street", 1, "Newark", 07107, "NJ", "United States");

-- Product
INSERT INTO Product (ptype, pname, pprice, description, pquantity) VALUES (2, "Samsung Laptop", 800.99, "A Samsung laptop.", 1001); -- 1
INSERT INTO Product (ptype, pname, pprice, description, pquantity) VALUES (1, "Dell Desktop", 560.20, "A Dell desktop computer.", 2567); -- 2
INSERT INTO Product (ptype, pname, pprice, description, pquantity) VALUES (2, "MacBook", 1100.99, "An Apple laptop.", 540); -- 3
INSERT INTO Product (ptype, pname, pprice, description, pquantity) VALUES (3, "Lazer Printer", 60.50, "A lazer printer.", 390); -- 4
INSERT INTO Product (ptype, pname, pprice, description, pquantity) VALUES (3, "Inkjet Printer", 50.80, "An inkjet printer.", 408); -- 5
INSERT INTO Product (ptype, pname, pprice, description, pquantity) VALUES (0, "Android Phone Charger", 15.99, "An Android phone charger.", 1098); -- 6
INSERT INTO Product (ptype, pname, pprice, description, pquantity) VALUES (0, "iPhone Charger", 20.99, "An iPhone charger.", 1070); -- 7
INSERT INTO Product (ptype, pname, pprice, description, pquantity) VALUES (0, "Headphones", 10.99, "A pair of headphones.", 230); -- 8

-- Computer (ptype=1)
INSERT INTO Computer (pid, cpu_type) VALUES (1, "i7 4770k");
INSERT INTO Computer (pid, cpu_type) VALUES (2, "i5");
INSERT INTO Computer (pid, cpu_type) VALUES (3, "i7 4770k");

-- Laptop (ptype=2)
INSERT INTO Laptop (pid, btype, weight) VALUES (1, "Something", 5);
INSERT INTO Laptop (pid, btype, weight) VALUES (3, "Something", 3);
-- Printer (ptype=3)

INSERT INTO Printer (pid, printer_type, resolution) VALUES (4, "HP", "Something");
INSERT INTO Printer (pid, printer_type, resolution) VALUES (5, "HP", "Something");

-- OfferProduct
INSERT INTO OfferProduct (pid, offer_price) VALUES (1, 750.99);
INSERT INTO OfferProduct (pid, offer_price) VALUES (2, 500.99);
INSERT INTO OfferProduct (pid, offer_price) VALUES (3, 1050.99);
INSERT INTO OfferProduct (pid, offer_price) VALUES (4, 58.80);
INSERT INTO OfferProduct (pid, offer_price) VALUES (5, 45.80);
INSERT INTO OfferProduct (pid, offer_price) VALUES (6, 14.80);
INSERT INTO OfferProduct (pid, offer_price) VALUES (7, 18.80);

-- Cart
INSERT INTO Cart (cid, sa_name, ccnumber, tstatus) VALUES (2, "Home", 5555678834678375, 0); -- 1

-- AppearsIn
INSERT INTO AppearsIn (cart_id, pid, quantity, price_sold) VALUES (1, 4, 3, 176.4);
