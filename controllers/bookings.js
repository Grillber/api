const express      = require('express');
const onlyLoggedIn = require('../lib/only-logged-in');

module.exports = (dataLoader) => {
  const bookingsController = express.Router();
  

//Create Booking
  bookingsController.post('/new', onlyLoggedIn, (req, res) => {
    console.log('asdfadgf')
    dataLoader.createBookings({
      productId: req.body.productId,
      userId: req.body.userId,
      dropDate: req.body.dropDate,
      pickUpDate: req.body.pickUpDate,
      location: req.body.location,
    })
     .then(data => res.json(data))
     .catch(err => res.status(400).json(err));
  });
  
  //Retrieve previous orders
  bookingsController.get('/', onlyLoggedIn, (req, res) => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    dataLoader.getAllBookings({
      page: req.query.page,
      limit: req.query.count
    }) 
    .then(data => res.json(data))
    .catch(err => res.status(400).json(err));
  });
  
  return bookingsController;
};