// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * Auxiliary schema that defines a product 
 * 
 * @type {Schema}
 */
var productModelSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
});

module.exports = productModelSchema;
