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
  userCtrl.create = function (userData) {
    var user = new User(userData);

    return user.save();
  };

  return userCtrl;
};
