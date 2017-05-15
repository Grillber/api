//Server

// Packages/Dependencies 
const express     = require('express');     //call express
const app         = express();              //Define app using express
const mysql       = require('promise-mysql');
const bodyParser  = require('body-parser'); 

// Data loader
const DashboardlyDataLoader = require('./lib/grillber_api.js');

// Controllers
const authController = require('./controllers/auth.js');
const bookingsController = require('./controllers/bookings.js');
const productsController = require('./controllers/products.js');
const boardsController = require('./controllers/bookings.js');
const bookmarksController = require('./controllers/products.js');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 1337; 

// Database / data loader initialization
const connection = mysql.createPool({
  user: 'root',
  database: 'grillber'
});
const dataLoader = new DashboardlyDataLoader(connection);

// Routes for API
var router = express.Router();


router.get('/', function(req, res) {
    res.json({ message: 'Grillber API is working' });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(checkLoginToken(dataLoader));
app.use(cors());
app.use('/api', router);

app.use('/auth', authController(dataLoader));
app.use('/bookings', bookingsController(dataLoader));
app.use('/products', productsController(dataLoader));

// Server start
app.listen(port);
console.log('API is running on port: ' + port);

