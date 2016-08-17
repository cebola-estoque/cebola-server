// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * @type {Schema}
 */
var invoiceSchema = new Schema({
  author: {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    }
  },

  code: {
    type: String,
  },
  
  /**
   * Stores a reference to the source
   * organization of the invoice
   * @type {Organization}
   */
  source: {
    _id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    }
  },

  /**
   * Stores a reference to the destination
   * organization of the invoice
   * @type {Organization}
   */
  destination: {
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
