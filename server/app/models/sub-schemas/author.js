// third-party dependencies
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

/**
 * Auxiliary schema that defines an author
 * 
 * @type {Schema}
 */
var authorSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
});

module.exports = authorSchema;
