// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * @type {Schema}
 */
var organizationContactSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  author: {
    _id: {
      type: String,
      required: true
    },
  },

  ownerOrg: {
    _id: {
      type: String,
      required: true,
    },
  },

  referredOrg: {
    _id: {
      type: String,
    },
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

  var Organization = conn.model('OrganizationContact', organizationContactSchema);
  
  return Organization;
};
