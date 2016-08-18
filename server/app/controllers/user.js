// third-party
const Bluebird = require('bluebird');

// constants
const SHARED_CONSTANTS = require('../../../shared/constants');

module.exports = function (app, options) {

  const User = app.services.mongoose.models.User;

  const errors = app.errors;

  var ctrl = {};

  /**
   * Creates a new user
   * @param  {Object} userData
   * @return {Bluebird -> user}
   */
  ctrl.create = function (email, plainTextPassword, data) {

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

  ctrl.getById = function (id) {
    return User.findOne({
      _id: id,
    })
    .then((user) => {
      if (!user) {
        return Bluebird.reject(new errors.NotFound('user', id));
      } else {
        return user;
      }
    });
  };

  ctrl.resetPassword = function (user, plainTextPassword) {
    return User.hashPassword(plainTextPassword)
      .then((passwordHash) => {
        user.set('_pwdHash', passwordHash);

        return user.save();
      });
  };

  ctrl.deactivate = function (user, reason) {
    user.setStatus(SHARED_CONSTANTS.USER_STATUSES.DEACTIVATED, reason);

    return user.save();
  };

  ctrl.activate = function (user, reason) {
    user.setStatus(SHARED_CONSTANTS.USER_STATUSES.ACTIVE, reason);

    return user.save();
  };

  return ctrl;
};
