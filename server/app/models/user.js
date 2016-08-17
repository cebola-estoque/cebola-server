// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * @type {Schema}
 */
var userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

// takes the connection and options and returns the model
module.exports = function (conn, app, options) {

  var User = conn.model('User', userSchema);
  
  return User;
};
