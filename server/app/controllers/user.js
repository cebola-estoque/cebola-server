// third-party
const Bluebird = require('bluebird');

// constants
const SHARED_CONSTANTS = require('../../../shared/constants');

module.exports = function (app, options) {

  const User = app.services.mongoose.models.User;

  const errors = app.errors;

  var userCtrl = {};

  /**
   * Creates a new user
   * @param  {Object} userData
   * @return {Bluebird -> user}
   */
  userCtrl.create = function (email, plainTextPassword, data) {

    if (!email) {
      return Bluebird.reject(new errors.InvalidOption('email', 'required'));
    }

    if (!plainTextPassword) {
      return Bluebird.reject(new errors.InvalidOption('plainTextPassword', 'required'));
    }

    // set the email
    data.email = email;

    return User.hashPassword(plainTextPassword)
      .then((passwordHash) => {
        data._pwdHash = passwordHash;

        var user = new User(data);

        // set user status to 'ACTIVE';
        user.setStatus(SHARED_CONSTANTS.USER_STATUSES.ACTIVE, 'UserCreated');

        return user.save();
      })
      .catch((err) => {

        if (err.name === 'MongoError' && err.code === 11000) {
          return Bluebird.reject(new errors.EmailTaken(email));
        }

        return Bluebird.reject(err);
      });
  };

  userCtrl.resetPassword = function (user, plainTextPassword) {
    return User.hashPassword(plainTextPassword)
      .then((passwordHash) => {
        user.set('_pwdHash', passwordHash);

        return user.save();
      });
  };

  userCtrl.deactivate = function (user, reason) {
    user.setStatus(SHARED_CONSTANTS.USER_STATUSES.DEACTIVATED, reason);

    return user.save();
  };

  userCtrl.activate = function (user, reason) {
    user.setStatus(SHARED_CONSTANTS.USER_STATUSES.ACTIVE, reason);

    return user.save();
  };

  return userCtrl;
};
