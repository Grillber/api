const express = require('express');     //call express
const mysql   = require('promise-mysql');


// Express middleware
const bodyParser      = require('body-parser');
const morgan          = require('morgan');
const checkLoginToken = require('./lib/check-login-token.js');
const cors            = require('cors');
const router          = require('router');


// Data loader
const GrillberDataLoader = require('./lib/grillber_api.js');


// Controllers
const authController     = require('./controllers/auth.js');
const bookingsController = require('./controllers/bookings.js');
const productsController = require('./controllers/products.js');

// Database / data loader initialization
let connection;
if(process.env.JAWSDB_URL){
  connection = mysql.createPool(process.env.JAWSDB_URL)
} else {
  connection = mysql.createPool({
    user: 'root',
    database: 'grillber'
  });
}
const dataLoader = new GrillberDataLoader(connection);


//Express Initialization
const app = express();          
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(checkLoginToken(dataLoader));
app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}));
// app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authController(dataLoader));
app.use('/products', productsController(dataLoader));
app.use('/bookings', bookingsController(dataLoader));


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (process.env.C9_HOSTNAME) {
    console.log(`Web server is listening on https://${process.env.C9_HOSTNAME}`);
  } else {
    console.log(`Web server is listening on http://localhost:${port}`);
  }
});