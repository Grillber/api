
//server.js

// Dependencies
const express     = require('express');
const bodyParser  = require('body-parser');


//DB connection 
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'localhost',
    user : 'uroot',
    password : '',
    database : 'myapp_test'
  }
});

// Express
const app = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);




// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     res.send('working');
// }); 





// Server start
app.listen(1337);
console.log('API is running on port 1337');

