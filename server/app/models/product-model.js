// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * @type {Schema}
 */
var productModelSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  sku: {
    type: String,
    required: true,
  },

  ownerOrg: {
    _id: {
      type: String,
      required: true,
    }
  }
});

// takes the connection and options and returns the model
module.exports = function (conn, app, options) {

  var ProductModel = conn.model('ProductModel', productModelSchema);
  
  return ProductModel;
};
