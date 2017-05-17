'use strict';
// const bcrypt    = require('bcrypt-as-promised');
const bcrypt    = require('bcrypt');
const knex      = require('knex')({ client: 'mysql' });
const validate  = require('./validations');
const util      = require('./util');

const HASH_ROUNDS = 10;

const USER_FIELDS = ['id', 'email', 'admin', 'name', 'phone', 'createdAt', 'updatedAt'];
const PRODUCT_FIELDS = ['id', 'category', 'title', 'description', 'priceDaily', 'priceWeekly', 'availability'];
const BOOKED_PRODUCTS_FIELDS = ['id', 'bookingId', 'productId', 'price'];
const BOOKING_FIELDS = ['id', 'userId', 'dropDate', 'pickUpDate','sum','status'];

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
          name: userData.name,
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
    const errors = validate.board(bookingsData);
    if (errors) {
      return Promise.reject({ errors: errors });
    }

    return this.query(
      knex
      .insert(util.filterKeys(BOOKING_FIELDS, bookingsData))
      .into('bookings')
      .toString()
    )
    .then((result) => {
      return this.query(
        knex
        .select(BOOKING_FIELDS)
        .from('bookings')
        .where('id', result.insertId)
        .toString()
      );
    });
  }

  bookingsBelongsToUser(bookingsId, userId) {
    console.log(bookingsId, "bookings id")
    return this.query(
      knex
      .select('id')
      .from('bookings')
      .where({
        id: bookingId,
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
