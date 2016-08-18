// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/organizations'
    app.middleware.authenticate(),
    bodyParser.json(),
    function (req, res, next) {

      app.controllers.organization.create(req.tokenData, req.body)
        .then((organization) => {
          res.json({
            _id: organization._id,
            name: organization.name,
          });
        })
        .catch(next);
    }
  );

  app.get('/organization/:organizationId',
    app.middleware.authenticate(),
    app.middleware.loadOrganization(),
    function (req, res, next) {

      // TODO verify user's access to organization
      res.json({
        _id: organization._id,
        name: organization.name,
        document: organization.document,
      });

    }
  );

};
