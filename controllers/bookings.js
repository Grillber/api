const express      = require('express');
const onlyLoggedIn = require('../lib/only-logged-in');

module.exports = (dataLoader) => {
  const bookingsController = express.Router();
  

//Create Order
  bookingsController.post('/placeOrder', (req, res) => {
    dataLoader.createOrder({
      dropDate: req.body.dropDate,
      pickUpDate: req.body.pickUpDate,
      location: req.body.location
    })
     .then(data => res.json(data))
     .catch(err => res.status(400).json(err));
  });
  
  //Retrieve previous orders
  bookingsController.get('/', (req, res) => {
    dataLoader.getAllBookings({
      page: req.query.page,
      limit: req.query.count
    }) 
    .then(data => res.json(data))
    .catch(err => res.status(400).json(err));
  });
  
  return bookingsController;
};