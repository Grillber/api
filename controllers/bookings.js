const express      = require('express');
const onlyLoggedIn = require('../lib/only-logged-in');

module.exports = (dataLoader) => {
  const bookingsController = express.Router();
  
  //Retrieve all orders
  bookingsController.get('/', onlyLoggedIn, (req, res) => {
    dataLoader.getAllBookings({
      page: req.query.page,
      limit: req.query.count
    }) 
    .then(data => res.status(200).json(data))
    .catch(err => res.status(400).json(err));

  }); 
  
  //Retrieve bookings from session token
  bookingsController.get('/:id', onlyLoggedIn, (req, res) => {
    dataLoader.getBookingsFromSession(req.params.id)
    .then((data) => res.status(200).json(data));
  });

  //Create Booking
  bookingsController.post('/new', onlyLoggedIn, (req, res) => {
    dataLoader.createBookings({
      userId: req.body.userId,
      productId: req.body.productId,
      dropDate: req.body.dropDate,
      pickUpDate: req.body.pickUpDate,
      location: req.body.location
    })
     .then(data => res.status(200).json(data))
     .catch(err => res.status(400).json(err)
     );
  });
  
  //Retrieves single booking by Id
  bookingsController.get('/:id', onlyLoggedIn, (req, res) => {
    dataLoader.getSingleBooking({
      id: req.params.id
    })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(400).json(err))
  });

  return bookingsController;
};