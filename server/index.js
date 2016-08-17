// third-party
const express = require('express');

/**
 * Function that instantiates the application
 */
function createInventoryAPI(options) {

  if (!options.mongodbURI) {
    throw new Error('mongodbURI is required');
  }

  // create express app instance
  var app = express();

  // make constants available throughout the application
  app.constants = require('../shared/constants');

  // make the error constructors available throughout the application
  app.errors = require('../shared/errors');

  // setup services
  require('./app/services')(app, options);

  // instantiate controllers
  app.controllers = {};
  app.controllers.organization =
    require('./app/controllers/organization')(app, options);
  app.controllers.productModel =
    require('./app/controllers/product-model')(app, options);
  app.controllers.user =
    require('./app/controllers/user')(app, options);
  app.controllers.record =
    require('./app/controllers/record')(app, options);
  app.controllers.invoice =
    require('./app/controllers/invoice')(app, options);
  app.controllers.inventory =
    require('./app/controllers/inventory')(app, options);

  // instantiate middleware for usage in routes
  app.middleware = {};

  // define description route
  app.get('/who', function (req, res) {
    res.json({ name: 'inventory-api' });
  });

  // load routes
  // require('./app/routes/inventory')(app, options);

  // load error-handlers
  require('./app/error-handlers/inventory-api-error')(app, options);

  return app;
}

module.exports = createInventoryAPI;