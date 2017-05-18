const express      = require('express');
const onlyLoggedIn = require('../lib/only-logged-in');

module.exports = (dataLoader) => {
  const bookingsController = express.Router();
  

//Create Booking
  bookingsController.post('/new', onlyLoggedIn, (req, res) => {
    dataLoader.createBookings({
      dropDate: req.body.dropDate,
      pickUpDate: req.body.pickUpDate,
      bookingTotal: req.body.bookingTotal,
      location: req.body.location,
      status: req.body.status
    })
     .then(data => res.json(data))
     .catch(err => res.status(400).json(err));
  });
  
  //Retrieve previous orders
  bookingsController.get('/', onlyLoggedIn, (req, res) => {
    dataLoader.getAllBookings({
      page: req.query.page,
      limit: req.query.count
    }) 
    .then(data => res.json(data))
    .catch(err => res.status(400).json(err));
  });
  
  return bookingsController;
};