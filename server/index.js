// third-party
const express = require('express');
const cors    = require('cors');

/**
 * Function that instantiates the application
 */
function cebolaServer(options) {

  if (!options.mongodbURI) {
    throw new Error('mongodbURI is required');
  }

  if (!options.secret) {
    throw new Error('secret is required');
  }

  // create express app instance
  var app = express();

  // make constants available throughout the application
  app.constants = require('../shared/constants');

  // make the error constructors available throughout the application
  app.errors = require('../shared/errors');

  // setup services
  require('./services')(app, options);

  // instantiate controllers
  app.controllers = {};
  // app.controllers.organizationContact =
  //   require('./controllers/organization-contact')(app, options);
  // app.controllers.productModel =
  //   require('./controllers/product-model')(app, options);
  app.controllers.user =
    require('./controllers/user')(app, options);
  app.controllers.auth =
    require('./controllers/auth')(app, options);
  app.controllers.allocation =
    require('./controllers/allocation')(app, options);
  app.controllers.operation =
    require('./controllers/operation')(app, options);
  app.controllers.shipment =
    require('./controllers/shipment')(app, options);
  // app.controllers.inventory =
  //   require('./controllers/inventory')(app, options);
  
  app.controllers.organization =
    require('./controllers/organization')(app, options);
  app.controllers.productModel =
    require('./controllers/product-model')(app, options);

  // instantiate middleware for usage in routes
  app.middleware = {};
  app.middleware.authenticate =
    require('./middleware/authenticate').bind(null, app);
  app.middleware.loadUser =
    require('./middleware/load-user').bind(null, app);
  app.middleware.loadShipment =
    require('./middleware/load-shipment').bind(null, app);

  // CORS
  var corsWhitelist = options.corsWhitelist || [];
  corsWhitelist = (typeof corsWhitelist === 'string') ?
    corsWhitelist.split(',') : corsWhitelist;

  var _corsMiddleware = cors({
    origin: function (origin, cb) {
      var originIsWhitelisted = (corsWhitelist.indexOf(origin) !== -1);

      if (!originIsWhitelisted) {
        console.warn('request from not-whitelisted origin %s', origin, corsWhitelist);
      }

      cb(null, originIsWhitelisted);
    }
  });

  app.options('*', _corsMiddleware);
  app.use(_corsMiddleware);


  // define description route
  app.get('/who', function (req, res) {
    res.json({ name: 'inventory-api' });
  });

  // load routes
  require('./routes/user')(app, options);
  require('./routes/auth')(app, options);
  require('./routes/organization')(app, options);
  require('./routes/product-model')(app, options);
  require('./routes/shipment')(app, options);

  // load error-handlers
  require('./error-handlers/inventory-api-error')(app, options);
  require('./error-handlers/mongoose-validation-error')(app, options);

  return app;
}

module.exports = cebolaServer;