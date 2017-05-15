
//server.js

// Packages/Dependencies 
const express     = require('express');     //call express
const app         = express();              //Define app using express
const bodyParser  = require('body-parser'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 1337; 
//DB connection 
// var knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host : 'localhost',
//     user : 'root',
//     password : '',
//     database : 'myapp_test'
//   }
// });

// Routes for API
var router = express.Router();


router.get('/', function(req, res) {
    res.json({ message: 'Grillber API is working' });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// Server start
app.listen(port);
console.log('API is running on port: ' + port);

