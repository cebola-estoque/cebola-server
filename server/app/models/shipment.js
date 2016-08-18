// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * @type {Schema}
 */
var shipmentSchema = new Schema({
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

  type: {
    type: String,
    required: true,
  },

  organization: {
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
   * Stores a reference to the source
   * organization of the shipment (if applicable)
   * @type {Organization}
   */
  source: {
    _id: {
      type: String,
    },

    name: {
      type: String,
    }
  },

  /**
   * Stores a reference to the destination
   * organization of the shipment (if applicable)
   * @type {Organization}
   */
  destination: {
    _id: {
      type: String,
    },

    name: {
      type: String,
    }
  },

  document: {
    type: Object,
  }
});

// takes the connection and options and returns the model
module.exports = function (conn, app, options) {

  var Shipment = conn.model('Shipment', shipmentSchema);
  
  return Shipment;
};
