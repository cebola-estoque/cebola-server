// third-party
const bodyParser = require('body-parser');
const Bluebird   = require('bluebird');

module.exports = function (app, options) {

  app.post('/shipments/entries',
    bodyParser.json(),
    function (req, res, next) {

      var supplier    = req.body.supplier;
      var allocations = req.body.allocations || [];

      app.controllers.shipment
        .scheduleEntry(supplier, req.body, allocations)
        .then((shipment) => {
          res.json(shipment);
        })
        .catch(next);
    }
  );

  app.get('/shipments/entries',
    function (req, res, next) {
      
      var query = {
        type: 'entry'
      };
      
      app.controllers.shipment
        .list(query)
        .then((shipments) => {
          res.json(shipments);
        })
        .catch(next);
      
    }
  );

  // app.get('/shipment/:shipmentId',
  //   app.middleware.authenticate(),
  //   function (req, res, next) {

  //     var _shipment;

  //     app.controllers.shipment.getById(req.params.shipmentId)
  //       .then((shipment) => {
  //         _shipment = shipment;

  //         return app.controllers.shipment.getSummary(shipment);
  //       })
  //       .then((summary) => {
  //         var shipmentData = _shipment.toJSON();

  //         shipmentData.allocations           = summary.allocations;
  //         shipmentData.unallocatedOperations = summary.unallocatedOperations;

  //         res.json(shipmentData);
  //       })
  //       .catch(next);

  //   }
  // );

  // app.post('/shipment/:shipmentId/operations/entries',
  //   app.middleware.authenticate(),
  //   app.middleware.loadShipment(),
  //   bodyParser.json(),
  //   function (req, res, next) {
      
  //     var shipment = req.shipment;

  //     app.controllers.operation.registerEntry(shipment, req.body)
  //       .then((operation) => {
  //         res.json(operation);
  //       })
  //       .catch(next);

  //   }
  // );
};
