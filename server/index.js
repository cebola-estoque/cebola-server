// third-party
const express  = require('express');
const cors     = require('cors');
const Bluebird = require('bluebird');
const Raven    = require('raven');

/**
 * Function that instantiates the application
 */
function cebolaServer(options) {

  if (!options.mongodbURI) {
    throw new Error('mongodbURI is required');
  }

  if (!options.temporaryPassword) {
    throw new Error('temporaryPassword is required');
  }

  options.temporarySecret = 'oqiwessqwo';

  if (!options.temporarySecret) {
    throw new Error('temporarySecret is required');
  }

  if (!options.secret) {
    throw new Error('secret is required');
  }

  if (!options.host) {
    throw new Error('host is required');
  }

  if (!options.corsAllowedOrigins) {
    throw new Error('corsAllowedOrigins is required');
  }

  options.host = options.host.replace(/\/$/, '');

  if (!/^https?\:\/\//.test(options.host)) {
    options.host = 'http://' + options.host;
  }

  // create express app instance
  var app = express();

  // if sentryDSN is set, enable raven requestHandler
  if (options.sentryDSN) {

    let sentryConfig = {
      environment: options.sentryEnvironment,
      release: require('../package.json').version,
    }

    Raven.config(options.sentryDSN, sentryConfig).install();
    app.use(Raven.requestHandler());
  }

  // expose options onto app
  app.APP_OPTIONS = options;

  // make constants available throughout the application
  app.constants = require('../shared/constants');

  // make the error constructors available throughout the application
  app.errors = require('../shared/errors');

  // setup services
  // the services setup is required for all other
  // parts of the application and is the starting point
  // of the `readiness` of the app
  app.ready = require('./services')(app, options).then(() => {

    // instantiate controllers
    app.controllers = {};
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
    app.controllers.inventory =
      require('./controllers/inventory')(app, options);
    app.controllers.organization =
      require('./controllers/organization')(app, options);
    app.controllers.productModel =
      require('./controllers/product-model')(app, options);

    // instantiate middleware for usage in routes
    app.middleware = {};
    app.middleware.authenticate =
      require('./middleware/authenticate').bind(null, app);
    app.middleware.authorize =
      require('./middleware/authorize').bind(null, app);
    app.middleware.loadUser =
      require('./middleware/load-user').bind(null, app);
    app.middleware.loadShipment =
      require('./middleware/load-shipment').bind(null, app);
    app.middleware.loadAllocation =
      require('./middleware/load-allocation').bind(null, app);
    app.middleware.loadOperation =
      require('./middleware/load-operation').bind(null, app);
    app.middleware.loadProductModel =
      require('./middleware/load-product-model').bind(null, app);
    app.middleware.loadOrganization =
      require('./middleware/load-organization').bind(null, app);

    // CORS
    var corsAllowedOrigins = options.corsAllowedOrigins || [];
    corsAllowedOrigins = (typeof corsAllowedOrigins === 'string') ?
      corsAllowedOrigins.split(',') : corsAllowedOrigins;

    var _corsMiddleware = cors({
      origin: function (origin, cb) {
        var originIsWhitelisted = (corsAllowedOrigins.indexOf(origin) !== -1);

        if (!originIsWhitelisted) {
          console.warn('request from not-whitelisted origin %s', origin, corsAllowedOrigins);
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

    /**
     * Authorization-related routes are loaded onto
     * a specific app
     */
    var accountApp = express();
    accountApp.errors      = app.errors;
    accountApp.controllers = app.controllers;
    accountApp.middleware  = app.middleware;
    accountApp.services    = app.services;
    require('./routes/auth')(accountApp, options);
    app.use('/account', accountApp);

    /**
     * Public routes
     */
    var publicApp = express();

    // expose app's properties
    publicApp.errors      = app.errors;
    publicApp.controllers = app.controllers;
    publicApp.middleware  = app.middleware;
    publicApp.services    = app.services;

    // authentication
    publicApp.use(app.middleware.authenticate());

    // load routes
    require('./routes/organization')(publicApp, options);
    require('./routes/product-model')(publicApp, options);
    require('./routes/shipment')(publicApp, options);
    require('./routes/inventory')(publicApp, options);
    require('./routes/operation')(publicApp, options);

    require('./routes/file')(publicApp, options);

    // mount public app
    app.use('/public', publicApp);

    // load error-handlers for the whole app
    // if sentryDSN is set, enable raven errorHandler
    if (options.sentryDSN) {
      app.use(Raven.errorHandler());
    }
    require('./error-handlers/cebola-api-error')(app, options);
    require('./error-handlers/mongoose-validation-error')(app, options);

  });

  app.destroy = function () {
    console.log('Cebola Server destroy routine started');

    return Bluebird.all([
      app.services.mongoose.connection.close()
    ]);
  };

  return app;
}

module.exports = cebolaServer;