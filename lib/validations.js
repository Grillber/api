const validate = require('validate.js');

const VALID_ID = {
  onlyInteger: true,
  greaterThan: 0
};

const USER_VALIDATION = {
  email: {
    presence: true,
    email: true
  },
  password: {
    presence: true,
    length: {
      minimum: 8,
      message: 'must be at least 8 characters'
    }
  }
};
exports.user = function validateUser(userData) {
  return validate(userData, USER_VALIDATION);
};


//Make specified changes for Grillber API
const BOOKINGS_VALIDATION = {
  userId: {
    presence: true,
    numericality: VALID_ID
  }
};
exports.board = function validateBookings(bookingsData) {
  return validate(bookingsData, BOOKINGS_VALIDATION);
};

// const BOARD_UPDATE_VALIDATION = {
//   ownerId: {
//     numericality: VALID_ID
//   }
// };
// exports.boardUpdate = function validateBoardUpdate(boardData) {
//   return validate(boardData, BOARD_UPDATE_VALIDATION);
// };

const CREDS_VALIDATION = {
  email: {
    presence: true,
    email: true
  },
  password: {
    presence: true
  }
};
exports.credentials = function validateCredentials(credsData) {
  return validate(credsData, CREDS_VALIDATION);
};

