// third-party dependencies
const mongoose = require('mongoose');
const Bluebird = require('bluebird');
const bcrypt   = require('bcrypt');

// constants
const Schema = mongoose.Schema;

// constants
const DEFAULT_SALT_ROUNDS = 10;

// promisified methods
const _bcryptHash    = Bluebird.promisify(bcrypt.hash);
const _bcryptCompare = Bluebird.promisify(bcrypt.compare);

/**
 * Verifies whether a string is in a valid email format
 * @param {String} str
 */
// http://stackoverflow.com/questions/46155/validate-email-address-in-javascript#46181
const EMAIL_REGEXP = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
function isEmail(str) {
  return EMAIL_REGEXP.test(str);
}

/**
 * @type {Schema}
 */
var userSchema = new Schema({

  /**
   * The user's email
   * @type {Object}
   */
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: isEmail,
      message: 'InvalidEmail',
      type: 'InvalidEmail',
    }
  },

  _pwdHash: {
    type: String,
    required: true,
  },

  roles: [String],

  status: {
    value: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    }
  }
});

// takes the connection and options and returns the model
module.exports = function (conn, app, options) {

  const saltRounds = options.saltRounds || DEFAULT_SALT_ROUNDS;

  userSchema.statics.hashPassword = function (plainTextPassword) {
    return _bcryptHash(plainTextPassword, saltRounds);
  };

  userSchema.methods.validatePassword = function (plainTextPassword) {
    var hash = this._pwdHash;

    return _bcryptCompare(plainTextPassword, hash);
  };

  userSchema.methods.setStatus = function (status, reason) {
    this.set('status', {
      value: status,
      reason: reason,
    });
  };

  var User = conn.model('User', userSchema);
  
  return User;
};
