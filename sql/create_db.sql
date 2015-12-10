CREATE DATABASE OnlineComputerStore;
USE OnlineComputerStore;

CREATE TABLE SilverAndAbove (
    cid SMALLINT UNSIGNED PRIMARY KEY,
    credit_line VARCHAR(30) NOT NULL
);

CREATE TABLE Customer (
    cid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(30) NOT NULL,
    lname VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    address VARCHAR(50) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    status TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE StoredCard (
    ccnumber BIGINT(16) UNSIGNED PRIMARY KEY,
    cid SMALLINT UNSIGNED NOT NULL
);

CREATE TABLE CreditCard (
    ccnumber BIGINT(16) UNSIGNED PRIMARY KEY,
    sec_number SMALLINT(3) UNSIGNED NOT NULL,
    owner_name VARCHAR(50) NOT NULL,
    cctype VARCHAR(30) NOT NULL,
    ccaddress VARCHAR(50) NOT NULL,
    exp_date DATE NOT NULL
);

CREATE TABLE ShippingAddress (
    cid SMALLINT UNSIGNED NOT NULL,
    sa_name VARCHAR(30) NOT NULL,
    recepient_name VARCHAR(30) NOT NULL,
    street VARCHAR(30) NOT NULL,
    snumber SMALLINT NOT NULL,
    city VARCHAR(30) NOT NULL,
    zip INT(10) NOT NULL,
    state VARCHAR(2) NOT NULL,
    country VARCHAR(30) NOT NULL,
    PRIMARY KEY(cid, sa_name)
);

CREATE TABLE Cart (
    cart_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cid SMALLINT UNSIGNED NOT NULL,
    sa_name VARCHAR(30),
    ccnumber BIGINT(16) UNSIGNED,
    tstatus TINYINT(1) DEFAULT 0,
    tdate TIMESTAMP
);

CREATE TABLE AppearsIn (
    cart_id SMALLINT UNSIGNED,
    pid SMALLINT UNSIGNED,
    quantity INT UNSIGNED NOT NULL,
    price_sold REAL(16,2) NOT NULL,
    PRIMARY KEY(cart_id, pid)
);

CREATE TABLE OfferProduct (
    pid SMALLINT UNSIGNED PRIMARY KEY,
    offer_price REAL(16,2) NOT NULL
);

CREATE TABLE Product (
    pid SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ptype TINYINT(1) UNSIGNED NOT NULL,
    pname VARCHAR(50) NOT NULL,
    pprice REAL(16,2) NOT NULL,
    description TEXT NOT NULL,
    pquantity INT UNSIGNED NOT NULL
);

CREATE TABLE Computer (
    pid SMALLINT UNSIGNED PRIMARY KEY,
    cpu_type VARCHAR(30) NOT NULL
);

CREATE TABLE Laptop (
    pid SMALLINT UNSIGNED PRIMARY KEY,
    btype VARCHAR(30) NOT NULL,
    weight SMALLINT NOT NULL
);

CREATE TABLE Printer (
    pid SMALLINT UNSIGNED PRIMARY KEY,
    printer_type VARCHAR(30) NOT NULL,
    resolution VARCHAR(11) NOT NULL
);
