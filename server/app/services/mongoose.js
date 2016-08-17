// third-party
const mongoose = require('mongoose');
const Bluebird = require('bluebird');

// Use bluebird as mongoose promise implementation
mongoose.Promise = Bluebird;

module.exports = function (app, options) {
  
  var mongooseService = {};
  app.services.mongoose = mongooseService;

  // create a connection to the database
  var conn = mongoose.createConnection(options.mongodbURI);
  mongooseService.connection = conn;

  // load models
  mongooseService.models = {};
  mongooseService.models.User =
    require('../models/user')(conn, app, options);
  mongooseService.models.Organization =
    require('../models/organization')(conn, app, options);
  mongooseService.models.ProductModel =
    require('../models/product-model')(conn, app, options);
  mongooseService.models.Record =
    require('../models/record')(conn, app, options);
  mongooseService.models.Invoice =
    require('../models/invoice')(conn, app, options);
};
