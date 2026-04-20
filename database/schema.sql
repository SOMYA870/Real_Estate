DROP DATABASE IF EXISTS real_estate;
CREATE DATABASE real_estate;
USE real_estate;



CREATE TABLE City (
    city_id   INT          PRIMARY KEY AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE PropertyType (
    type_id   INT         PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT chk_type CHECK (type_name IN ('Flat', 'House', 'Villa', 'Plot'))
);


CREATE TABLE Owner (
    owner_id INT          PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    phone    VARCHAR(15)  NOT NULL UNIQUE,
    email    VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL DEFAULT '123456'
);


CREATE TABLE Agent (
    agent_id     INT          PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(100) NOT NULL,
    phone        VARCHAR(15)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    joining_date DATE         NOT NULL,
    password     VARCHAR(255) NOT NULL DEFAULT '123456'
);

CREATE TABLE Client (
    client_id INT          PRIMARY KEY AUTO_INCREMENT,
    name      VARCHAR(100) NOT NULL,
    phone     VARCHAR(15)  NOT NULL UNIQUE,
    email     VARCHAR(100) UNIQUE DEFAULT NULL,
    password  VARCHAR(255) NOT NULL DEFAULT '123456',
    type      VARCHAR(50)  NOT NULL,
    CONSTRAINT chk_client_type CHECK (type IN ('buyer', 'renter'))
);

CREATE TABLE Admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) DEFAULT 'System Admin',
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);


-- TABLE: Property
-- 1NF: All atomic values, no repeating groups
-- 2NF: All attributes fully depend on property_id (single PK)
-- 3NF: city and type extracted to lookup tables to remove
--      transitive dependencies (property_id -> city_name,
--      property_id -> type_name now go via FK)

CREATE TABLE Property (
    property_id          INT         PRIMARY KEY,
    city_id              INT         NOT NULL,
    type_id              INT         NOT NULL,
    size                 INT         NOT NULL CHECK (size > 0),
    bedrooms             INT         NOT NULL CHECK (bedrooms >= 0),
    bathrooms            INT         NOT NULL CHECK (bathrooms >= 0),
    year_of_construction INT         NOT NULL CHECK (year_of_construction BETWEEN 1800 AND 2100),
    selling_price        FLOAT       DEFAULT NULL CHECK (selling_price >= 0),
    rent_price           FLOAT       DEFAULT NULL CHECK (rent_price >= 0),
    status               VARCHAR(50) NOT NULL DEFAULT 'available',
    owner_id             INT         NOT NULL,
    agent_id             INT         DEFAULT NULL,
    listed_on            DATE        NOT NULL,
    CONSTRAINT chk_property_status CHECK (status IN ('available', 'sold', 'rent')),
    FOREIGN KEY (city_id)  REFERENCES City(city_id) ON DELETE RESTRICT,
    FOREIGN KEY (type_id)  REFERENCES PropertyType(type_id) ON DELETE RESTRICT,
    FOREIGN KEY (owner_id) REFERENCES Owner(owner_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES Agent(agent_id) ON DELETE SET NULL
);


-- TABLE: Sale
-- 1NF: Atomic values
-- 2NF: All attributes depend on sale_id
-- 3NF: No transitive dependencies — buyer/agent/property
--      details are never stored here, only FK references
-- UNIQUE on property_id: a property can only be sold once

CREATE TABLE Sale (
    sale_id        INT   PRIMARY KEY,
    property_id    INT   NOT NULL UNIQUE,
    buyer_id       INT   NOT NULL,
    agent_id       INT   NOT NULL,
    sale_date      DATE  NOT NULL,
    price          FLOAT NOT NULL CHECK (price > 0),
    days_on_market INT   NOT NULL CHECK (days_on_market >= 0),
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id)    REFERENCES Client(client_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id)    REFERENCES Agent(agent_id) ON DELETE CASCADE
);


CREATE TABLE Inquiry (
    inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    client_id INT NOT NULL,
    agent_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    intent ENUM('buy', 'rent') DEFAULT 'buy',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES Client(client_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES Agent(agent_id) ON DELETE CASCADE
);


-- TABLE: Rental
-- 3NF: rent details (amount, dates) depend only on rental_id
--      client/agent/property info accessed via FK only
-- CHECK: end_date must be after start_date

CREATE TABLE Rental (
    rental_id      INT   PRIMARY KEY,
    property_id    INT   NOT NULL,
    client_id      INT   NOT NULL,
    agent_id       INT   NOT NULL,
    rent_amount    FLOAT NOT NULL CHECK (rent_amount > 0),
    start_date     DATE  NOT NULL,
    end_date       DATE  NOT NULL,
    days_on_market INT   NOT NULL CHECK (days_on_market >= 0),
    CONSTRAINT chk_rental_dates CHECK (end_date > start_date),
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    FOREIGN KEY (client_id)   REFERENCES Client(client_id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id)    REFERENCES Agent(agent_id) ON DELETE CASCADE
);


-- TABLE: Review
-- 3NF: rating/comment depend only on review_id
--      no client or property details stored here directly
-- UNIQUE (client_id, property_id): one review per client per property

CREATE TABLE Review (
    review_id   INT          PRIMARY KEY,
    client_id   INT          NOT NULL,
    property_id INT          NOT NULL,
    rating      INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     VARCHAR(255) DEFAULT NULL,
    review_date DATE         NOT NULL,
    CONSTRAINT uq_review UNIQUE (client_id, property_id),
    FOREIGN KEY (client_id)   REFERENCES Client(client_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE
);


-- TABLE: Amenity

CREATE TABLE Amenity (
    amenity_id   INT          PRIMARY KEY AUTO_INCREMENT,
    amenity_name VARCHAR(100) NOT NULL UNIQUE
);


-- TABLE: Property_Amenity  (Junction/Bridge table)
-- 1NF: Composite PK, no repeating groups
-- 2NF: No non-key attributes — nothing to be partially dependent
-- 3NF: No non-key attributes — nothing to be transitively dependent
-- This table resolves the M:N between Property and Amenity

CREATE TABLE Property_Amenity (
    property_id INT NOT NULL,
    amenity_id  INT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id)  REFERENCES Amenity(amenity_id) ON DELETE CASCADE
);


-- INDEXES

CREATE INDEX idx_property_owner    ON Property(owner_id);
CREATE INDEX idx_property_city     ON Property(city_id);
CREATE INDEX idx_property_type     ON Property(type_id);
CREATE INDEX idx_sale_property     ON Sale(property_id);
CREATE INDEX idx_sale_agent        ON Sale(agent_id);
CREATE INDEX idx_rental_property   ON Rental(property_id);
CREATE INDEX idx_rental_agent      ON Rental(agent_id);
CREATE INDEX idx_review_property   ON Review(property_id);
CREATE INDEX idx_review_client     ON Review(client_id);


-- DATA INSERTS

INSERT INTO City (city_name) VALUES ('Delhi'), ('Mumbai'), ('Pune'), ('Patna'), ('Guwahati');

INSERT INTO PropertyType (type_name) VALUES ('Flat'), ('House');

INSERT INTO Owner (owner_id, name, phone, email) VALUES
(1,'Rahul','9991110001','rahul@gmail.com'),
(2,'Anita','9991110002','anita@gmail.com'),
(3,'Vikas','9991110003','vikas@gmail.com'),
(4,'Neha','9991110004','neha@gmail.com'),
(5,'Amit','9991110005','amit@gmail.com'),
(6,'Suresh','9991110006','suresh@gmail.com'),
(7,'Priya','9991110007','priya@gmail.com'),
(8,'Rohan','9991110008','rohan@gmail.com'),
(9,'Kiran','9991110009','kiran@gmail.com'),
(10,'Pooja','9991110010','pooja@gmail.com'),
(11,'Arjun','9991110011','arjun@gmail.com'),
(12,'Sneha','9991110012','sneha@gmail.com'),
(13,'Manish','9991110013','manish@gmail.com'),
(14,'Kavita','9991110014','kavita@gmail.com'),
(15,'Deepak','9991110015','deepak@gmail.com');

INSERT INTO Agent (agent_id, name, phone, email, joining_date) VALUES
(1,'Amit Sharma','9000000001','a1@mail.com','2022-01-01'),
(2,'Priya Mehta','9000000002','a2@mail.com','2022-01-05'),
(3,'Rohit Verma','9000000003','a3@mail.com','2022-02-10'),
(4,'Neha Kapoor','9000000004','a4@mail.com','2022-02-10'),
(5,'Arjun Singh','9000000005','a5@mail.com','2022-03-15'),
(6,'Sneha Joshi','9000000006','a6@mail.com','2022-03-15'),
(7,'Vikas Gupta','9000000007','a7@mail.com','2022-04-01'),
(8,'Pooja Shah','9000000008','a8@mail.com','2022-04-20'),
(9,'Karan Malhotra','9000000009','a9@mail.com','2022-05-05'),
(10,'Riya Patel','9000000010','a10@mail.com','2022-05-05'),
(11,'Manish Yadav','9000000011','a11@mail.com','2022-06-10'),
(12,'Kavita Nair','9000000012','a12@mail.com','2022-06-15'),
(13,'Deepak Kumar','9000000013','a13@mail.com','2022-07-01'),
(14,'Anjali Desai','9000000014','a14@mail.com','2022-07-01'),
(15,'Suresh Reddy','9000000015','a15@mail.com','2022-08-12'),
(16,'Nikita Jain','9000000016','a16@mail.com','2022-08-20'),
(17,'Rahul Das','9000000017','a17@mail.com','2022-09-10'),
(18,'Meera Iyer','9000000018','a18@mail.com','2022-09-10'),
(19,'Aditya Roy','9000000019','a19@mail.com','2022-10-01'),
(20,'Simran Kaur','9000000020','a20@mail.com','2022-10-15');

INSERT INTO Client (client_id, name, phone, type) VALUES
(1,'Aarav Sharma','8000000001','buyer'),
(2,'Vivaan Patel','8000000002','renter'),
(3,'Aditya Singh','8000000003','buyer'),
(4,'Krishna Verma','8000000004','renter'),
(5,'Arjun Mehta','8000000005','buyer'),
(6,'Sai Kumar','8000000006','renter'),
(7,'Rohan Gupta','8000000007','buyer'),
(8,'Kunal Shah','8000000008','renter'),
(9,'Yash Jain','8000000009','buyer'),
(10,'Raj Malhotra','8000000010','renter'),
(11,'Ananya Sharma','8000000011','buyer'),
(12,'Diya Patel','8000000012','renter'),
(13,'Isha Singh','8000000013','buyer'),
(14,'Meera Verma','8000000014','renter'),
(15,'Pooja Mehta','8000000015','buyer'),
(16,'Sneha Kumar','8000000016','renter'),
(17,'Riya Gupta','8000000017','buyer'),
(18,'Kavya Shah','8000000018','renter'),
(19,'Neha Jain','8000000019','buyer'),
(20,'Simran Kaur','8000000020','renter'),
(21,'Rahul Das','8000000021','buyer'),
(22,'Amit Yadav','8000000022','renter'),
(23,'Suresh Reddy','8000000023','buyer'),
(24,'Manish Nair','8000000024','renter'),
(25,'Vikas Choudhary','8000000025','buyer'),
(26,'Deepak Mishra','8000000026','renter'),
(27,'Kiran Rao','8000000027','buyer'),
(28,'Nitin Agarwal','8000000028','renter'),
(29,'Gaurav Bansal','8000000029','buyer'),
(30,'Tarun Saxena','8000000030','renter'),
(31,'Shreya Iyer','8000000031','buyer'),
(32,'Aishwarya Nair','8000000032','renter'),
(33,'Nikita Jain','8000000033','buyer'),
(34,'Priya Desai','8000000034','renter'),
(35,'Anjali Roy','8000000035','buyer'),
(36,'Pallavi Singh','8000000036','renter'),
(37,'Divya Kapoor','8000000037','buyer'),
(38,'Ritika Malhotra','8000000038','renter'),
(39,'Muskan Arora','8000000039','buyer'),
(40,'Payal Gupta','8000000040','renter'),
(41,'Harsh Vardhan','8000000041','buyer'),
(42,'Abhishek Tiwari','8000000042','renter'),
(43,'Rajat Sharma','8000000043','buyer'),
(44,'Mohit Sinha','8000000044','renter'),
(45,'Akash Pandey','8000000045','buyer'),
(46,'Varun Khanna','8000000046','renter'),
(47,'Sameer Khan','8000000047','buyer'),
(48,'Imran Ali','8000000048','renter'),
(49,'Faizan Sheikh','8000000049','buyer'),
(50,'Zaid Ansari','8000000050','renter');


INSERT INTO Property VALUES
(1,1,1,1200,3,2,2015,5000000,20000,'available',1,'2023-01-01'),
(2,2,2,2000,4,3,2018,8000000,30000,'sold',1,'2023-02-01'),
(3,3,1,1000,2,2,2017,4000000,15000,'rent',2,'2023-03-01'),
(4,1,1,900,2,1,2016,3500000,12000,'available',2,'2023-01-10'),
(5,4,1,1100,3,2,2019,6000000,22000,'sold',3,'2023-02-10'),
(6,5,2,1800,4,3,2014,7000000,25000,'rent',3,'2023-03-10'),
(7,1,1,800,2,1,2013,3000000,10000,'available',4,'2023-01-15'),
(8,2,2,2200,5,4,2020,9000000,35000,'sold',4,'2023-02-15'),
(9,3,1,950,2,2,2018,4200000,16000,'rent',5,'2023-03-15'),
(10,4,1,1300,3,2,2016,5200000,21000,'available',1,'2023-01-20'),
(11,5,1,1400,3,2,2017,5800000,23000,'sold',2,'2023-02-20'),
(12,3,2,2000,4,3,2015,7500000,26000,'rent',3,'2023-03-20'),
(13,1,1,1000,2,2,2019,4500000,17000,'available',4,'2023-01-25'),
(14,2,2,2100,4,3,2018,8200000,31000,'sold',5,'2023-02-25'),
(15,3,1,900,2,1,2017,3800000,14000,'rent',1,'2023-03-25'),
(16,4,1,1250,3,2,2016,5100000,20000,'available',2,'2023-01-28'),
(17,5,1,1350,3,2,2017,5700000,22000,'sold',3,'2023-02-28'),
(18,3,2,1900,4,3,2015,7200000,25000,'rent',4,'2023-03-28'),
(19,1,1,950,2,2,2018,4300000,16000,'available',5,'2023-01-30'),
(20,2,2,2300,5,4,2020,9500000,36000,'sold',1,'2023-02-28'),
(21,3,1,1050,2,2,2017,4100000,15000,'rent',2,'2023-03-30'),
(22,4,1,1150,3,2,2016,4900000,19000,'available',3,'2023-01-12'),
(23,5,1,1250,3,2,2018,5600000,21000,'sold',4,'2023-02-12'),
(24,3,2,1750,4,3,2014,6900000,24000,'rent',5,'2023-03-12'),
(25,1,1,850,2,1,2013,3100000,11000,'available',1,'2023-01-18'),
(26,2,2,2400,5,4,2021,9700000,37000,'sold',2,'2023-02-18'),
(27,3,1,980,2,2,2019,4400000,17000,'rent',3,'2023-03-18'),
(28,4,1,1200,3,2,2015,5000000,20000,'available',4,'2023-01-22'),
(29,5,1,1300,3,2,2017,5800000,23000,'sold',5,'2023-02-22'),
(30,3,2,1850,4,3,2016,7100000,25000,'rent',1,'2023-03-22');

INSERT INTO Amenity (amenity_id, amenity_name) VALUES
(1,'Private Gallery'),
(2,'Wine Vault'),
(3,'Parking'),
(4,'Infinity Pool'),
(5,'Smart Home System'),
(6,'Home Cinema'),
(7,'Elevator'),
(8,'Spa & Sauna'),
(9,'Gym');

INSERT INTO Property_Amenity VALUES
(1,1),(1,2),(1,4),(1,5),(1,9),
(2,3),(2,4),(2,6),(2,8),
(3,1),(3,5),(3,7),
(4,2),(4,5),
(5,4),(5,8),(5,6),(6,5),(6,1),(6,2),(5,9),
(7,1),(7,7),(8,2),(8,3),(8,4),(8,8),(8,9),
(9,3),(9,5),(10,1),(10,4),(10,6),
(11,4),(11,5),(11,8),(12,5),(12,2),(12,7),(12,9),
(13,2),(13,6), (14,3),(14,4),(14,8),
(15,1),(15,5),(15,9), (16,2),(16,4),(16,7),
(17,4),(17,5),(17,8), (18,1),(18,3),(18,6),
(19,2),(19,5), (20,3),(20,4),(20,8),(20,9),
(21,1),(21,6), (22,4),(22,5),(22,7),
(23,1),(23,2),(23,8), (24,3),(24,5),(24,6),
(25,4),(25,7), (26,1),(26,2),(26,3),(26,4),(26,8),
(27,2),(27,5), (28,1),(28,6),(28,7),
(29,4),(29,5),(29,8), (30,2),(30,3),(30,6);

INSERT INTO Sale VALUES
(1,2,1,1,'2023-05-01',8000000,40),
(2,5,3,2,'2023-05-10',6000000,30),
(3,8,5,3,'2023-05-15',9000000,25),
(4,11,7,4,'2023-05-20',5800000,20),
(5,14,9,5,'2023-05-25',8200000,35),
(6,17,11,6,'2023-06-01',5700000,28),
(7,20,13,7,'2023-06-05',9500000,32),
(8,23,15,8,'2023-06-10',5600000,22),
(9,26,17,9,'2023-06-15',9700000,18),
(10,29,19,10,'2023-06-20',5800000,26);

INSERT INTO Rental VALUES
(1,3,2,1,15000,'2023-07-01','2024-07-01',10),
(2,6,4,2,25000,'2023-07-05','2024-07-05',12),
(3,9,6,3,16000,'2023-07-10','2024-07-10',15),
(4,12,8,4,26000,'2023-07-15','2024-07-15',20),
(5,15,10,5,14000,'2023-07-20','2024-07-20',8),
(6,18,12,6,25000,'2023-07-25','2024-07-25',14),
(7,21,14,7,15000,'2023-08-01','2024-08-01',9),
(8,24,16,8,24000,'2023-08-05','2024-08-05',11),
(9,27,18,9,17000,'2023-08-10','2024-08-10',13),
(10,30,20,10,25000,'2023-08-15','2024-08-15',16);

INSERT INTO Review VALUES
(1,1,2,5,'Excellent property','2023-06-01'),
(2,2,3,4,'Good for rent','2023-06-05'),
(3,3,5,5,'Very spacious','2023-06-10'),
(4,4,6,3,'Average condition','2023-06-12'),
(5,5,8,5,'Loved the location','2023-06-15'),
(6,6,9,4,'Nice amenities','2023-06-18'),
(7,7,11,5,'Worth the price','2023-06-20'),
(8,8,12,3,'Could be better','2023-06-22'),
(9,9,14,4,'Good investment','2023-06-25'),
(10,10,15,5,'Highly recommended','2023-06-28'),
(11,11,17,4,'Comfortable stay','2023-07-01'),
(12,12,18,3,'Decent property','2023-07-03');


DELIMITER $$

CREATE TRIGGER trg_after_sale
AFTER INSERT ON Sale
FOR EACH ROW
BEGIN
    UPDATE Property
    SET status = 'sold'
    WHERE property_id = NEW.property_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_after_rent
AFTER INSERT ON Rental
FOR EACH ROW
BEGIN
    UPDATE Property
    SET status = 'rent'
    WHERE property_id = NEW.property_id;
END$$

CREATE TRIGGER trg_after_sale_delete
AFTER DELETE ON Sale
FOR EACH ROW
BEGIN
    UPDATE Property
    SET status = 'available'
    WHERE property_id = OLD.property_id;
END$$

CREATE TRIGGER trg_after_rent_delete
AFTER DELETE ON Rental
FOR EACH ROW
BEGIN
    UPDATE Property
    SET status = 'available'
    WHERE property_id = OLD.property_id;
END$$

DELIMITER ;

-- Insert Default Admin
INSERT INTO Admin (email, password) VALUES ('admin@realestate.com', '123456');

-- ===============================
-- PROCEDURES & FUNCTIONS
-- ===============================

DELIMITER $$

CREATE PROCEDURE sp_RegisterClient(
    IN p_name VARCHAR(100),
    IN p_phone VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_type VARCHAR(50)
)
BEGIN
    INSERT INTO Client (name, phone, email, password, type) 
    VALUES (p_name, p_phone, p_email, p_password, p_type);
END$$

DELIMITER ;

DELIMITER $$

CREATE FUNCTION fn_GetAvailablePropertiesCount(p_city_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total FROM Property 
    WHERE city_id = p_city_id AND status = 'available';
    RETURN total;
END$$

DELIMITER ;



-- Address addded

ALTER TABLE Property
ADD address VARCHAR(100);

UPDATE Property SET address='Karol Bagh', city_id = 1 WHERE property_id IN (1,7,13,19,25);
UPDATE Property SET address='Lajpat Nagar', city_id = 1 WHERE property_id IN (4);
UPDATE Property SET address='Dwarka', city_id = 1 WHERE property_id IN (10,16);

UPDATE Property SET address='Andheri', city_id = 2 WHERE property_id IN (2,8,14,20,26);

UPDATE Property SET address='Hinjewadi', city_id = 3 WHERE property_id IN (3,12,21,30);
UPDATE Property SET address='Kothrud', city_id = 3 WHERE property_id IN (6,15,24);
UPDATE Property SET address='Wakad', city_id = 3 WHERE property_id IN (9,18,27);

UPDATE Property SET address='Kankarbagh', city_id = 4 WHERE property_id IN (5,16,22);
UPDATE Property SET address='Boring Road', city_id = 4 WHERE property_id IN (10,28);

UPDATE Property SET address='Dispur', city_id = 5 WHERE property_id IN (11,17,29);
UPDATE Property SET address='AIDC', city_id = 5 WHERE property_id IN (6,23);