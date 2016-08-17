// third-party
const Bluebird = require('bluebird');

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

        return user.save();
      });
  };

  return userCtrl;
};
