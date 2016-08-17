// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * @type {Schema}
 */
var organizationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  document: {
    value: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    }
  }
});

// takes the connection and options and returns the model
module.exports = function (conn, app, options) {

  var Organization = conn.model('Organization', organizationSchema);
  
  return Organization;
};
