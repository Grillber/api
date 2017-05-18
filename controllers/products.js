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
      date: '2017-05-21 16:00'//req.query.date//
    })
    //.then(data => console.log('data produstcController.get', data))
    .then(data => res.status(200).json(data))
    //.catch(err => res.status(400).jason(err));
  });
  
  return productsController;
};

