const express      = require('express');
const onlyLoggedIn = require('../lib/only-logged-in');

module.exports = (dataLoader) => {
  const productsController = express.Router();
  
  // Retrieve a list of products
  productsController.get('/', (req, res) => {
      dataLoader.getAllProduct({
          page: req.query.page,
          limit: req.query.count
      })
      .then(data => res.status(200).json(data))
      .catch(err => res.status(400).json(err));
  });
  
  // Return a list of available equipment
  productsController.get('/availableProducts', (req, res) => {
    dataLoader.getAvailableProduct({
      //requested date, product, drop zone
    })
    .then(console.log(req.query))
    .then(data => res.status(200).json(data))
    .catch(err => res.status(400).jason(err));
  });
  
  return productsController;
};

