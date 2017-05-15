
// Dependencies
const express = require('express');
const bodyParser = require('body-parser');

// Database / data loader initialization
// const connection = mysql.createPool({
//   user: 'root',
//   database: ''
// });
// const dataLoader = new DATABASENAME(connection);

// Express
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('working');
}); 


// Server start
app.listen(1337);
console.log('API is running on port 1337')

