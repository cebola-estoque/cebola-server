// third-party
const Bluebird = require('bluebird');
const jwt      = require('jsonwebtoken');

// constants
const SHARED_CONSTANTS = require('../../shared/constants');

// promisify methods
const _jwtSign   = Bluebird.promisify(jwt.sign);
const _jwtVerify = Bluebird.promisify(jwt.verify);

module.exports = function (app, options) {

  /**
   * Temporary secret info
   */
  const TEMPORARY_PASSWORD = options.temporaryPassword;
  const TEMPORARY_SECRET   = options.temporarySecret;

  const SECRET = options.secret;

  const User = app.services.mongoose.models.User;

  const errors = app.errors;

  var authCtrl = {};

  /**
   * Temporary password token generator.
   * Used for generating tokens using a fixed password.
   * 
   * @param  {String} plainTextPassword
   * @return {Bluebird -> JWT}
   */
  authCtrl.generateTemporaryToken = function (plainTextPassword) {

    if (plainTextPassword !== TEMPORARY_PASSWORD) {
      return Bluebird.reject(new errors.Unauthorized());
    }

    var payload = {};

    // password is valid
    return _jwtSign(payload, TEMPORARY_SECRET, {
      expiresIn: '30d',
      subject: 'TEMPORARY_USER',
    });
  };

  // authCtrl.generateToken = function (email, plainTextPassword) {

  //   if (!email) {
  //     return Bluebird.reject(new errors.InvalidOption('email', 'required'));
  //   }

  //   if (!plainTextPassword) {
  //     return Bluebird.reject(new errors.InvalidOption('plainTextPassword', 'required'));
  //   }

  //   var _user;

  //   return User.findOne({
  //     // use email as the unique identifier
  //     email: email,

  //     // ensure the user is ACTIVE
  //     'status.value': SHARED_CONSTANTS.USER_STATUSES.ACTIVE,
  //   })
  //   .then((user) => {

  //     if (!user) {
  //       console.log('user missing')
  //       return Bluebird.reject(new errors.Unauthorized());
  //     }

  //     _user = user;

  //     return user.validatePassword(plainTextPassword);
  //   })
  //   .then((valid) => {

  //     if (!valid) {
  //       console.log('invalid password')
  //       return Bluebird.reject(new errors.Unauthorized());
  //     }

  //     var payload = {
  //       name: _user.name,
  //       email: _user.email,
  //       roles: _user.roles,
  //     };

  //     // password is valid
  //     return _jwtSign(payload, SECRET, {
  //       expiresIn: '30d',
  //       subject: _user._id.toString(),
  //     });
  //   })
  //   .catch((err) => {
  //     return Bluebird.reject(new errors.Unauthorized());
  //   });
    
  // };

  // authCtrl.verifyToken = function (token) {
  //   return _jwtVerify(token, SECRET)
  //     .catch((err) => {
  //       return Bluebird.reject(new errors.Unauthorized());
  //     });
  // };

  return authCtrl;
};
