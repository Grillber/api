DROP DATABASE IF EXISTS grillber;

CREATE DATABASE grillber;

USE grillber;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(60) NOT NULL,
  admin BOOLEAN NOT NULL DEFAULT 0,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(14),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  imageFrontUrl VARCHAR(100),
  imageOpenUrl VARCHAR(100),
  priceDaily DECIMAL(13,2),
  priceWeekly DECIMAL(13,2),
  availability BOOLEAN DEFAULT 1
);

CREATE TABLE  bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  dropDate TIMESTAMP NULL DEFAULT NULL,
  pickUpDate TIMESTAMP,
  sum DECIMAL(13,2),
  location VARCHAR(50),
  status ENUM('opened', 'payed', 'delivered', 'pickedUp', 'closed') DEFAULT 'opened'
);

CREATE TABLE booked_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL REFERENCES bookings (id),
  productId INT  NOT NULL REFERENCES products (id),
  price DECIMAL(13,2)
);

INSERT INTO products (category, title, description, imageFrontUrl, imageOpenUrl, priceDaily, priceWeekly)
VALUES ('BBQ & Grills', 'SIGNET™ 90',
"<div><p>The SIGNET™ 90 features 635 sq. in. total cooking space including  a porcelain coated warming rack, reversible heavy-duty cast iron cooking grids, stainless steel Flav-R-Wave cooking system, 3 stainless steel Dual-Tube burners, and stainless steel drop-down side shelves and enclosed cabinet base.</p></div> <div><h3>40,000 BTU</h3><h5>Main Burner Output</h5><br /><h3>3</h3><h5>Burners</h5><br /><h3>10,000 BTU</h3><h5>Side Burner</h5><br /><h3>15,000 BTU</h3><h5>Rotisserie Burner</h5><br><h3>400 sq. in.</h3><h5>Primary Cooking Space</h5></div>",
'http://www.broilkingbbq.com/en_ca/img/grills/95834/grill_straight_95834.png',
'http://www.broilkingbbq.com/en_ca/img/grills/98688/grill_over_98688.png',
100.00, 500.00);

INSERT INTO products (category, title, description, imageFrontUrl, imageOpenUrl, priceDaily, priceWeekly)
VALUES ('BBQ & Grills', 'REGAL™ S590 PRO',
"<div><p>The REGAL™ S590 Pro features 875 sq. in. total cooking space including porcelain coated warming rack, solid 9mm stainless steel cooking grids, stainless steel Flav-R-Wave cooking system, 5 stainless steel Dual-Tube burners, stainless steel side shelves, illuminated control knobs, and an enclosed cabinet base.</p></div> <div><h3>55,000 BTU</h3><h5>Main Burner Output</h5><br /><h3>5</h3><h5>Burners</h5><br /><h3>10,000 BTU</h3><h5>Side Burner</h5><br /><h3>15,000 BTU</h3><h5 class>Rotisserie Burner</h5><br><h3>625 sq. in.</h3><h5>Primary Cooking Space</h5></div>",
'http://www.broilkingbbq.com/en_ca/img/grills/95834/grill_straight_95834.png',
'http://www.broilkingbbq.com/en_ca/img/grills/95834/grill_over_95834.png',
110.00, 660.00); 

INSERT INTO products (category, title, description, imageFrontUrl, imageOpenUrl, priceDaily, priceWeekly)
VALUES ('BBQ & Grills', 'IMPERIAL™ XLS',
"<div><p>The Broil King&#174; IMPERIAL™ XLS features two totally independent ovens with a total of 1000 sq. in. of cooking space and includes 6 stainless steel Dual-Tube burners, professional cast stainless steel cooking grids, stainless steel Flav-R-Wave cooking system, built-in oven and control knob lights, two electronic igniters. The XLS features stainless steel side shelves with right side storage drawer and an enclosed cabinet base with two utility drawers and two cabinet doors.</p></div> <div><h3>60,000 BTU</h3><h5>Main Burner Output</h5><br /><h3>6</h3><h5>Burners</h5><br /><h3>10,000 BTU</h3><h5>Side Burner</h5><br /><h3>15,000 BTU</h3><h5>Rotisserie Burner</h5><br><h3>750 sq. in.</h3><h5>Primary Cooking Space</h5></div>",
'http://www.broilkingbbq.com/en_ca/img/grills/95788/grill_straight_95788.png',
'http://www.broilkingbbq.com/en_ca/img/grills/95788/grill_over_95788.png',
120.00, 720.00);

INSERT INTO products (category, title, description, imageFrontUrl, imageOpenUrl, priceDaily, priceWeekly)
VALUES ('BBQ & Grills', 'KEG® 2000',
"<div><p class='desc2'>The Broil KEG® 2000 features 280 sq. in. total cooking space, a heavy-duty cast iron cooking grid, heavy-duty steel base and black paint finish.</p></div>",
'http://www.broilkingbbq.com/en_ca/img/grills/91105/grill_straight_91105.png',
'http://www.broilkingbbq.com/en_ca/img/grills/91105/grill_over_91105.png',
60.00, 360.00);








