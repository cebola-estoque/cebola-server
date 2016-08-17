// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * @type {Schema}
 */
var invoiceSchema = new Schema({
  author: {
    type: require('./sub-schemas/author'),
  },

  code: {
    type: String,
    required: true
  },
  
  fromOrg: {
    _id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    }
  },

  toOrg: {
    _id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    }
  },
});

// takes the connection and options and returns the model
module.exports = function (conn, app, options) {

  var Invoice = conn.model('Invoice', invoiceSchema);
  
  return Invoice;
};
