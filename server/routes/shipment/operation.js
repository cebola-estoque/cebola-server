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
    function (req, res, next) {
      
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
