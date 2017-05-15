//Grillber.js API

// Dependencies
const express = require('express');
var router = express.Router();

// Router
router.get('/users', (req, res) => {
    res.send('api is working');
})
// Return Router
module.exports = router; 