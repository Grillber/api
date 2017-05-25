'use strict';
const bcrypt    = require('bcrypt');
const knex      = require('knex')({ client: 'mysql' });
const validate  = require('./validations');
const util      = require('./util');

const HASH_ROUNDS = 10;

const USER_FIELDS = ['id', 'email', 'admin', 'firstName', 'lastName', 'phone', 'createdAt', 'updatedAt'];
const PRODUCT_FIELDS = ['id', 'category', 'title', 'description', 'imageFrontUrl', 'imageOpenUrl',
'priceDaily', 'priceWeekly', 'available'];
const BOOKED_PRODUCTS_FIELDS = ['bookingId', 'productId', 'price'];
const BOOKING_FIELDS_JOINED = ['bookings.userId', 'bookings.dropDate', 'bookings.pickUpDate', 'bookings.bookingTotal', 'bookings.location', 'bookings.status', 'products.title', 'products.description'];
const BOOKING_FIELDS = ['userId', 'dropDate', 'pickUpDate', 'location'];

class GrillberDataLoader {
  constructor(conn) {
    this.conn = conn;
  }

  query(sql) {
    return this.conn.query(sql);
  }

  // User methods
  createUser(userData) {
    const errors = validate.user(userData);
    if (errors) {
      return Promise.reject({ errors: errors });
    }

    return bcrypt.hash(userData.password, HASH_ROUNDS)
    .then((hashedPassword) => {
      return this.query(
        knex
        .insert({
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone
          })
        .into('users')
        .toString()
      );
    })
    .then((result) => {
      return this.query(
        knex
        .select(USER_FIELDS)
        .from('users')
        .where('id', result.insertId)
        .toString()
      );
    })
    .then(result => result[0])
    .catch((error) => {
        throw error;
    });
  }

  // deleteUser(userId) {
  //   return this.query(
  //     knex.delete().from('users').where('id', userId).toString()
  //   );
  // }

  //Get user from session
  getUserFromSession(sessionToken) {
    return this.query(
      knex
      .select(util.joinKeys('users', USER_FIELDS))
      .from('sessions')
      .join('users', 'sessions.userId', '=', 'users.id')
      .where({
        'sessions.token': sessionToken
      })
      .toString()
    )
    .then((result) => {
      if (result.length === 1) {
        return result[0];
      }
      return null;
    });
  }
  
  //Create token from Credentials
  createTokenFromCredentials(email, password) {
    const errors = validate.credentials({
      email: email,
      password: password
    });
    if (errors) {
      return Promise.reject({ errors: errors });
    }
    let sessionToken;
    let user;
    return this.query(
      knex
      .select('id', 'password')
      .from('users')
      .where('email', email)
      .toString()
    )
    .then((results) => {
      if (results.length === 1) {
        user = results[0];
        return bcrypt.compare(password, user.password).catch(() => false);
      }
      return false;
    })
    .then((result) => {
      if (result === true) {
        return util.getRandomToken();
      }
      throw new Error('Username or password invalid');
    })
    .then((token) => {
      sessionToken = token;
      return this.query(
        knex
        .insert({
          userId: user.id,
          token: sessionToken
        })
        .into('sessions')
        .toString()
      );
    })
    .then(() => sessionToken);
  }

  deleteToken(token) {
    return this.query(
      knex
      .delete()
      .from('sessions')
      .where('token', token)
      .toString()
    )
    .then(() => true);
  }


  //Products methods
  
  //Retreive the list of all products
  getAllProduct(options) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const offset = (page - 1) * limit;

    return this.query(
      knex
      .select(PRODUCT_FIELDS)
      .from('products')
      .limit(limit)
      .offset(offset)
      .toString()
    );
  }
  
  //Get all available products
  getAvailableProduct(date) {
    var date = date.date;
    var query = knex
      .select(
        'p.id',
        'p.category',
        'p.title',
        'p.description',
        'p.imageFrontUrl',
        'p.imageOpenUrl',
        'p.priceDaily',
        'p.priceWeekly',
        'p.available',
        'b.dropDate',
        'b.pickUpDate'
        )
      .from('products as p')
      .leftJoin('booked_products as b_p', 'p.id', 'b_p.productId')
      .leftJoin('bookings as b', 'b.id', 'b_p.bookingId')
      .where('p.available', 1)
      .where(function() {
        this.where('b.pickUpDate', '<', `${date}`)
        .orWhereNull('b.pickUpDate')
        .orWhere('b.dropDate', '>' , `${date}`)
        .orWhereNull('b.dropDate')
      })
      .toString();
    return this.query(
      query
    );
  }

  //Booking Methods
  //Retreive all bookings
  getAllBookings(options) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const offset = (page - 1) * limit;
    return this.query(
      knex
      .select(BOOKING_FIELDS)
      .from('bookings')
      .limit(limit)
      .offset(offset)
      .toString()
    );
  }
  
  //Retrieve bookings that belongs to the user with sesstionToken
  // getBookingsFromSession(sessionToken){
  //   return this.query(
  //     knex
  //     .select('userId')
  //     .from('sessions')
  //     .where('token', sessionToken)
  //     .toString()
  //   )
  //   .then((result) => {
  //     return this.query(
  //       knex
  //       .select('p.title', 'b_p.bookingId', 'b.dropDate', 'b.pickUpDate', 'b.bookingTotal')
  //       .from('bookings as b')
  //       .leftJoin('booked_products as b_p', 'b.id', 'b_p.bookingId')
  //       .leftJoin('products as p', 'p.id', 'b_p.productId')
  //       .where('b.userId', result[0].userId)
  //       .toString()
  //     );
  //   })
  //   .then((result) => {
  //     var res_array = [];
  //     for ( var i = 0, l = result.length; i < l; i++) {
  //       var position = res_array.map(function(item){ return item.bookingId }).indexOf(result[i].bookingId);
  //       if ( position === -1 ) {
  //         result[i].title = [result[i].title];
  //         res_array.push(result[i]);
  //       }
  //       else {
  //         res_array[position].title.push(result[i].title);
  //       }
  //   }
  //   return res_array;
  //   });
  // }

  //Retrieve bookings that belongs to the user with userId
  getBookingsFromSession(userId){
      return this.query(
        knex
        .select('p.title', 'b_p.bookingId', 'b.dropDate', 'b.pickUpDate', 'b.bookingTotal', 'b.location')
        .from('bookings as b')
        .leftJoin('booked_products as b_p', 'b.id', 'b_p.bookingId')
        .leftJoin('products as p', 'p.id', 'b_p.productId')
        .where('b.userId', userId)
        .toString()
      )
    .then((result) => {
      var res_array = [];
      for ( var i = 0, l = result.length; i < l; i++) {
        var position = res_array.map(function(item){ return item.bookingId }).indexOf(result[i].bookingId);
        if ( position === -1 ) {
          result[i].title = [result[i].title];
          res_array.push(result[i]);
        }
        else {
          res_array[position].title.push(result[i].title);
        }
    }
    return res_array;
    });
  }

  //Retreive single booking
  getSingleBooking(bookingId) {
    return this.query(
      knex
      .select(BOOKING_FIELDS_JOINED)
      .from('bookings')
      .leftJoin('booked_products', 'bookings.id', 'booked_products.bookingId')
      .leftJoin('products', 'products.id', 'booked_products.productId')
      .where('bookings.id', bookingId.id)
      .toString()
    );
  }

  //Create new booking
  createBookings(bookingsData) {
    var bookingId;
    var bookingTotal;
    //Creates booking in bookings table
    return this.query(
      knex
      .insert(util.filterKeys(BOOKING_FIELDS, bookingsData))
      .into('bookings')
      .toString()
    )
    .then((result) => { 
      return bookingId = result.insertId; 
    })
    //Selects the price for the product 
    .then(() => {
      return Promise.all(bookingsData.productId.map((product) => {
        return this.query( 
        knex
        .select('priceDaily') 
        .from ('products')
        .where('id', product)
        .toString()
        )
        //Inserts bookingId, productId and Price into booked_products table
        .then ((result) => {
          return this.query (
            knex
            .insert({
            bookingId: bookingId,
            productId: product,
            price: result[0].priceDaily
            })
            .into('booked_products')
            .toString()
            );
        });
      }));
    })
    //Finds the sum of price the products in booked_products for a single booking
    .then (() => {
      return this.query (
      knex ('booked_products')
      //.select("*")
      .sum('price')
      .where('bookingId', bookingId)
      .toString()
      );
    }) 
    //Calculates the amount of days for the new order
    .then((result) => {
      bookingTotal = result[0]["sum(`price`)"];
      var query = `select TIMESTAMPDIFF(DAY, dropDate, pickUpDate) from bookings where id = ${bookingId}`;
      return this.query (query);
    })
    // Updates price into bookings table
    .then ((result) => {
      bookingTotal = result[0]['TIMESTAMPDIFF(DAY, dropDate, pickUpDate)'] * bookingTotal;
      return this.query (
        knex ('bookings')
        .where('id', bookingId)
        .update({
          bookingTotal: bookingTotal
        })
        .toString()
      );
    });
  }

  
  bookingsBelongsToUser(bookingsId, userId) {
    return this.query(
      knex
      .select('id')
      .from('bookings')
      .where({
        id: bookingsId,
        ownerId: userId
      })
      .toString()
    )
    .then((results) => {
      if (results.length === 1) {
        return true;
      }

      throw new Error('Access denied');
    });
  }
}

module.exports = GrillberDataLoader;
