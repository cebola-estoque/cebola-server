// third-party
const bodyParser = require('body-parser');
const Bluebird   = require('bluebird');

module.exports = function (app, options) {
  
  // TODO: auth
  /**
   * Creates operations for the given shipment
   */
  app.post('/shipment/:shipmentId/operations',
    app.middleware.loadShipment(),
    bodyParser.json(),
    function (req, res, next) {
      
      var shipment = req.shipment;
      var operationsToCreate = req.body;

      console.log
      
      if (!operationsToCreate || !Array.isArray(operationsToCreate)) {
        next(new app.errors.InvalidOption('operationsToCreate', 'required'));
        return;
      }
      
      return Bluebird.all(operationsToCreate.map((toCreate) => {
        
        // TODO: create allocate method on operation controller
        // that will choose the correct operation type
        if (shipment.type === 'entry') {
          return app.controllers.operation.registerEntry(
            toCreate.product,
            toCreate.quantity,
            shipment
          );
        } else if (shipment.type === 'exit') {
          return app.controllers.operation.registerExit(
            toCreate.product,
            toCreate.quantity,
            shipment
          );
        }
        
      }))
      .then((operations) => {
        res.json(operations);
      })
      .catch(next);
    }
  );
  
  app.get('/shipment/:shipmentId/operations',
    function (req, res, next) {
      
    }
  );
  
  // TODO: auth
  /**
   * Updates operation
   */
  app.put('/shipment/:shipmentId/operation/:operationId',
    app.middleware.loadShipment(),
    app.middleware.loadAllocation(),
    function (req, res, next) {
      
    }
  );
  
  // TODO: auth
  /**
   * Cancels operation
   */
  app.delete('/shipment/:shipmentId/operation/:operationId',
    app.middleware.loadShipment(),
    app.middleware.loadAllocation(),
    function (req, res, next) {
      
    }
  );
};
