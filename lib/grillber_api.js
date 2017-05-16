'use strict';
const bcrypt    = require('bcrypt-as-promised');
const knex      = require('knex')({ client: 'mysql' });
const validate  = require('./validations');
const util      = require('./util');

const HASH_ROUNDS = 10;

const USER_FIELDS = ['id', 'email', 'admin', 'name', 'phone', 'createdAt', 'updatedAt'];
const PRODUCT_FIELDS = ['id', 'category', 'title', 'description', 'priceDaily', 'priceWeekly', 'availability'];
const BOOKED_PRODUCTS_FIELDS = ['id', 'bookingId', 'productId', 'price'];
const BOOKING_FIELDS = ['id', 'userId', 'dropDate', 'pickUpDate','sum','status'];
// const BOOKMARK_WRITE_FIELDS = ['boardId', 'title', 'url'];

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

  deleteUser(userId) {
    return this.query(
      knex.delete().from('users').where('id', userId).toString()
    );
  }

  // getUserFromSession(sessionToken) {
  //   return this.query(
  //     knex
  //     .select(util.joinKeys('users', USER_FIELDS))
  //     .from('sessions')
  //     .join('users', 'sessions.userId', '=', 'users.id')
  //     .where({
  //       'sessions.token': sessionToken
  //     })
  //     .toString()
  //   )
  //   .then((result) => {
  //     if (result.length === 1) {
  //       return result[0];
  //     }

  //     return null;
  //   });
  // }

  // createTokenFromCredentials(email, password) {
  //   const errors = validate.credentials({
  //     email: email,
  //     password: password
  //   });
  //   if (errors) {
  //     return Promise.reject({ errors: errors });
  //   }

  //   let sessionToken;
  //   let user;
  //   return this.query(
  //     knex
  //     .select('id', 'password')
  //     .from('users')
  //     .where('email', email)
  //     .toString()
  //   )
  //   .then((results) => {
  //     if (results.length === 1) {
  //       user = results[0];
  //       return bcrypt.compare(password, user.password).catch(() => false);
  //     }

  //     return false;
  //   })
  //   .then((result) => {
  //     if (result === true) {
  //       return util.getRandomToken();
  //     }

  //     throw new Error('Username or password invalid');
  //   })
  //   .then((token) => {
  //     sessionToken = token;
  //     return this.query(
  //       knex
  //       .insert({
  //         userId: user.id,
  //         token: sessionToken
  //       })
  //       .into('sessions')
  //       .toString()
  //     );
  //   })
  //   .then(() => sessionToken);
  // }

  // deleteToken(token) {
  //   return this.query(
  //     knex
  //     .delete()
  //     .from('sessions')
  //     .where('token', token)
  //     .toString()
  //   )
  //   .then(() => true);
  // }


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

  // getSingleBoard(boardId) {
  //   return this.query(
  //     knex
  //     .select(BOARD_FIELDS)
  //     .from('boards')
  //     .where('id', boardId)
  //     .toString()
  //   );
  // }

  // createBoard(boardData) {
  //   const errors = validate.board(boardData);
  //   if (errors) {
  //     return Promise.reject({ errors: errors });
  //   }

  //   return this.query(
  //     knex
  //     .insert(util.filterKeys(BOARD_WRITE_FIELDS, boardData))
  //     .into('boards')
  //     .toString()
  //   )
  //   .then((result) => {
  //     return this.query(
  //       knex
  //       .select(BOARD_FIELDS)
  //       .from('boards')
  //       .where('id', result.insertId)
  //       .toString()
  //     );
  //   });
  // }

  // boardBelongsToUser(boardId, userId) {
  //   console.log(boardId, "the board id")
  //   return this.query(
  //     knex
  //     .select('id')
  //     .from('boards')
  //     .where({
  //       id: boardId,
  //       ownerId: userId
  //     })
  //     .toString()
  //   )
  //   .then((results) => {
  //     if (results.length === 1) {
  //       return true;
  //     }

  //     throw new Error('Access denied');
  //   });
  // }

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



  // Bookmark methods
  // getAllBookmarksForBoard(boardId/*, options*/) {
    //option on hold for a while
    // TODO: this is up to you to implement :)
//       const page = 1//Number(options.page) || 1;
//       const limit = 9//Number(options.limit) || 9;
//       const offset = (page - 1) * limit;
      
//       return this.query(
//       knex
//       .select(BOOKMARK_FIELDS)
//       .from('bookmarks')
//       .limit(limit)
//       .offset(offset)
//       .where('boardId', boardId)
//       .toString()
//     );
//   }

//   createBookmark(bookmarkData) {
//     // TODO: this is up to you to implement :)
//     const errors = validate.bookmark(bookmarkData);
//     if (errors) {
//       return Promise.reject({ errors: errors });
//     }

//     return this.query(
//       knex
//       .insert(util.filterKeys(BOOKMARK_WRITE_FIELDS, bookmarkData))
//       .into('bookmarks')
//       .toString()
//     )
//     .then((result) => {
//       //console.log(result);
//       return this.query(
//         knex
//         .select(BOOKMARK_FIELDS)
//         .from('bookmarks')
//         .where('id', result.insertId)
//         .toString()
//       );
//     });  
//   }

//   bookmarkBelongsToUser(bookmarkId, userId) {
//     // TODO: this is up to you to implement :)
//     return this.query(
//       knex('bookmarks')
//       .join('boards', 'bookmarks.boardId', '=', 'boards.id')
//       .where({
//         'bookmarks.id': bookmarkId,
//         ownerId: userId
//       })
//       .toString()
//     )
//     .then((results) => {
//       if (results.length === 1) {
//         return true;
//       }

//       throw new Error('Access denied');
//     });
//   }

//   updateBookmark(bookmarkId, bookmarkData) {
//     // TODO: this is up to you to implement :)
//     const errors = validate.bookmarkUpdate(bookmarkData);
//     if (errors) {
//       return Promise.reject({ errors: errors });
//     }

//     return this.query(
//       knex('bookmarks')
//       .update(util.filterKeys(BOOKMARK_WRITE_FIELDS, bookmarkData))
//       .where('id', bookmarkId)
//       .toString()
//     )
//     .then(() => {
//       return this.query(
//         knex
//         .select(BOOKMARK_FIELDS)
//         .from('bookmarks')
//         .where('id', bookmarkId)
//         .toString()
//       );
//     });
//   }

//   deleteBookmark(bookmarkId) {
//     // TODO: this is up to you to implement :)
//     return this.query(
//       knex
//       .delete()
//       .from('bookmarks')
//       .where('id', bookmarkId)
//       .toString()
//     );
//   }
}

module.exports = GrillberDataLoader;
