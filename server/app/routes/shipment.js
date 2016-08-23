// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/shipments',
    app.middleware.authenticate(),
    bodyParser.json(),
    function (req, res, next) {

      var authorData = {
        _id: req.tokenData.sub,
        name: req.tokenData.name,
      };

      var operations = req.body.operations || [];

      app.controllers.shipment
        .create(authorData, req.body)
        .then((shipment) => {

          return app.controllers.operation
            .scheduleOperations(
              authorData,
              shipment,
              operations
            );
        })
        .then((operations) => {
          res.json(operations);
        })
        .catch(next);
    }
  );

  app.get('/shipments',
    app.middleware.authenticate(),
    function (req, res, next) {

      app.controllers.shipment.list()
        .then((shipments) => {
          res.json(shipments);
        })
        .catch(next);
    }
  );

};
