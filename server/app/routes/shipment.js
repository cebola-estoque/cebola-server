// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/organization/:organizationId/shipments'
    app.middleware.authenticate(),
    app.middleware.loadOrganization(),
    bodyParser.json(),
    function (req, res, next) {

      app.controllers.create(req.tokenData, req.organization, req.body)
        .then((shipment) => {
          res.json({
            _id: shipment._id,
          });
        })
        .catch(next);
    }
  );

  app.get('/organization/:organizationId/shipment/:shipmentId'
    app.middleware.authenticate(),
    app.middleware.loadOrganization(),
    app.middleware.loadShipment(),
    function (req, res, next) {
      res.json({
        _id: req.shipment._id
      })
    }
  );

};
