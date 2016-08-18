// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/organization/:organizationId/schedule-entry',
    app.middleware.authenticate(),
    app.middleware.loadOrganization(),
    bodyParser.json(),
    function (req, res, next) {

    }
  );
  app.post('/organization/:organizationId/schedule-exit',
    app.middleware.authenticate(),
    app.middleware.loadOrganization(),
    bodyParser.json(),
    function (req, res, next) {

    }
  );
  app.post('/organization/:organizationId/register-loss',
    app.middleware.authenticate(),
    app.middleware.loadOrganization(),
    bodyParser.json(),
    function (req, res, next) {

    }
  );
};
