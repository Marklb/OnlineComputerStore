USE OnlineComputerStore;

ALTER TABLE SilverAndAbove
ADD CONSTRAINT fk_cid
FOREIGN KEY(cid)
REFERENCES Customer(cid);

ALTER TABLE StoredCard
ADD CONSTRAINT fk_ccnumber
FOREIGN KEY(ccnumber)
REFERENCES CreditCard(ccnumber);

ALTER TABLE StoredCard
ADD CONSTRAINT fk_sc_cid
FOREIGN KEY(cid)
REFERENCES Customer(cid);

ALTER TABLE ShippingAddress
ADD CONSTRAINT fk_sa_cid
FOREIGN KEY(cid)
REFERENCES Customer(cid);

ALTER TABLE Cart
ADD CONSTRAINT fk_cid_sa_name
FOREIGN KEY(cid, sa_name)
REFERENCES ShippingAddress(cid, sa_name);

ALTER TABLE Cart
ADD CONSTRAINT fk_cc_number
FOREIGN KEY(ccnumber)
REFERENCES CreditCard(ccnumber);

ALTER TABLE AppearsIn
ADD CONSTRAINT fk_cart_id
FOREIGN KEY(cart_id)
REFERENCES Cart(cart_id);

ALTER TABLE AppearsIn
ADD CONSTRAINT fk_ai_pid
FOREIGN KEY(pid)
REFERENCES Product(pid);

ALTER TABLE OfferProduct
ADD CONSTRAINT fk_op_pid
FOREIGN KEY(pid)
REFERENCES Product(pid);

ALTER TABLE Computer
ADD CONSTRAINT fk_c_pid
FOREIGN KEY(pid)
REFERENCES Product(pid);

ALTER TABLE Laptop
ADD CONSTRAINT fk_l_pid
FOREIGN KEY(pid)
REFERENCES Product(pid);

ALTER TABLE Laptop
ADD CONSTRAINT fk_lc_pid
FOREIGN KEY(pid)
REFERENCES Computer(pid);

ALTER TABLE Printer
ADD CONSTRAINT fk_p_pid
FOREIGN KEY(pid)
REFERENCES Product(pid);
