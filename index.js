const express = require('express');     //call express
const mysql = require('promise-mysql');

// Express middleware
const bodyParser = require('body-parser');
const morgan = require('morgan');
const checkLoginToken = require('./lib/check-login-token.js');
const cors = require('cors');

// Data loader
const GrillberDataLoader = require('./lib/grillber_api.js');

// Controllers
const authController = require('./controllers/auth.js');
const bookingsController = require('./controllers/bookings.js');
const productsController = require('./controllers/products.js');

// Database / data loader initialization
const connection = mysql.createPool({
  user: 'root',
  database: 'grillber'
});
const dataLoader = new GrillberDataLoader(connection);


// Express initialization
const app = express();              //Define app using express
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(checkLoginToken(dataLoader));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', router);


app.use('/auth', authController(dataLoader));
app.use('/bookings', bookingsController(dataLoader));
app.use('/products', productsController(dataLoader));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (process.env.C9_HOSTNAME) {
    console.log(`Web server is listening on https://${process.env.C9_HOSTNAME}`);
  } else {
    console.log(`Web server is listening on http://localhost:${port}`);
  }
});