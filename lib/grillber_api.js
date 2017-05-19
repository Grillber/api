'use strict';
const bcrypt    = require('bcrypt');
const knex      = require('knex')({ client: 'mysql' });
const validate  = require('./validations');
const util      = require('./util');

const HASH_ROUNDS = 10;

const USER_FIELDS = ['id', 'email', 'admin', 'firstName', 'lastName', 'phone', 'createdAt', 'updatedAt'];
const PRODUCT_FIELDS = ['id', 'category', 'title', 'description', 'imageFrontUrl', 'imageOpenUrl',
'priceDaily', 'priceWeekly', 'available'];
const BOOKED_PRODUCTS_FIELDS = ['id', 'bookingId', 'productId', 'price'];
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

  // getSingleBoard(boardId) {
  //   return this.query(
  //     knex
  //     .select(BOARD_FIELDS)
  //     .from('boards')
  //     .where('id', boardId)
  //     .toString()
  //   );
  // }

  createBookings(bookingsData) {
    // const errors = validate.booking(bookingsData);
    // if (errors) {
    //   return Promise.reject({ errors: errors });
    // }
    var bookingId;
    return this.query(
      knex
      .insert(util.filterKeys(BOOKING_FIELDS, bookingsData))
      .into('bookings')
      .toString()
    )
    .then((result) => { 
      bookingId = result.insertId; 
      return this.query( 
        knex
        .select('priceDaily') 
        .from ('products')
        .where('id', bookingsData.productId)
      .toString()
      )
    })
    .then ((result) => {
      // console.log(result[0].priceDaily)
      return this.query (
        knex
          .insert({
          bookingId: bookingId,
          productId: bookingsData.productId,
          price: result[0].priceDaily
          })
          .into('booked_products')
        .toString()
        )
        .then (() => {
          return this.query (
          knex ('booked_products')
          .sum('price')
          .where('bookingId', bookingId)
          .toString()
          )
        })
        .then ((result) => {
          var bookingTotal = result[0]["sum(`price`)"];
          return this.query (
            knex ('bookings')
            .where('id', bookingId)
            .update({
              bookingTotal: bookingTotal
            })
            .toString()
          )
        })
      })
  }

  
  bookingsBelongsToUser(bookingsId, userId) {
    console.log(bookingsId, "bookings id")
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

  // updateBoard(boardId, boardData) {
  //   const errors = validate.boardUpdate(boardData);
  //   if (errors) {
  //     return Promise.reject({ errors: errors });
  //   }

  //   return this.query(
  //     knex('boards')
  //     .update(util.filterKeys(BOARD_WRITE_FIELDS, boardData))
  //     .where('id', boardId)
  //     .toString()
  //   )
  //   .then(() => {
  //     return this.query(
  //       knex
  //       .select(BOARD_FIELDS)
  //       .from('boards')
  //       .where('id', boardId)
  //       .toString()
  //     );
  //   });
  // }

  // deleteBoard(boardId) {
  //   return this.query(
  //     knex
  //     .delete()
  //     .from('boards')
  //     .where('id', boardId)
  //     .toString()
  //   );
  // }
}

module.exports = GrillberDataLoader;
