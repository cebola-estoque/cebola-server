// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/organization/:organizationId/contacts'
    app.middleware.authenticate(),
    bodyParser.json(),
    function (req, res, next) {

      app.controllers.organizationContact.create(req.tokenData, req.body)
        .then((organizationContact) => {
          res.json({
            _id: organizationContact._id,
            name: organizationContact.name,
          });
        })
        .catch(next);
    }
  );

  app.get('/organization/:organizationId/contacts',
    app.middleware.authenticate(),
    app.middleware.loadOrganization(),
    function (req, res, next) {



    }
  );

};
