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
  // mongooseService.models.OrganizationContact =
  //   require('../models/organization-contact')(conn, app, options);
  // mongooseService.models.ProductModel =
  //   require('../models/product-model')(conn, app, options);
  // mongooseService.models.Operation =
  //   require('../models/operation')(conn, app, options);
  // mongooseService.models.Shipment =
  //   require('../models/shipment')(conn, app, options);
};
