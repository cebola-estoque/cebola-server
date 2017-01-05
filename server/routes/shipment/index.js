// third-party
const bodyParser = require('body-parser');
const Bluebird   = require('bluebird');

const aux = require('../../auxiliary');

module.exports = function (app, options) {
  
  // TODO: auth
  app.post('/shipments/entries',
    bodyParser.json(),
    function (req, res, next) {

      var supplier    = req.body.supplier;
      var allocations = req.body.allocations || [];
      
      var shipmentData = req.body;
      delete shipmentData.supplier;
      delete shipmentData.allocations;
      
      app.controllers.shipment
        .scheduleEntry(supplier, shipmentData, allocations)
        .then((shipment) => {
          res.json(shipment);
        })
        .catch(next);
    }
  );
  
  // TODO: auth
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

  // TODO: auth
  app.post('/shipments/exits',
    bodyParser.json(),
    function (req, res, next) {

      var recipient   = req.body.recipient;
      var allocations = req.body.allocations || [];
      
      var shipmentData = req.body;
      delete shipmentData.recipient;
      delete shipmentData.allocations;

      console.log('exit shipment allocations', allocations);
      
      app.controllers.shipment
        .scheduleExit(recipient, shipmentData, allocations)
        .then((shipment) => {
          res.json(shipment);
        })
        .catch(next);
    }
  );

  // TODO: auth
  app.get('/shipments/exits',
    function (req, res, next) {
      
      var query = {
        type: 'exit'
      };
      
      app.controllers.shipment
        .list(query)
        .then((shipments) => {
          res.json(shipments);
        })
        .catch(next);
    }
  );

  // TODO: auth
  /**
   * Retrieves a given shipment's data
   * Optionally returns all shipment records as well
   * 
   */
  app.get('/shipment/:shipmentId',
    // app.middleware.authenticate(),
    app.middleware.loadShipment(),
    function (req, res, next) {
      
      var withRecords = req.query.withRecords || true;
      
      var shipment = req.shipment;
      
      if (withRecords) {
        
        app.services.cebola.record.listByShipment(shipment)
          .then((records) => {
            var shipmentData = shipment.toJSON();
            
            // filter out allocations
            // and transform them into json objects
            // so that we may manipulate properties directly (w/out mongoose)
            var allocations = records.filter((record) => {
              return record.kind === 'ProductAllocation';
            })
            .map((allocationModel) => {
              return allocationModel.toJSON();
            });
            
            // filter out operations
            var operations = records.filter((record) => {
              return record.kind === 'ProductOperation';
            })
            .map((operationModel) => {
              return operationModel.toJSON();
            });
            
            // separate operations into allocations
            allocations.forEach((allocation) => {
              allocation.operations = {
                active: operations.filter((op) => {
                  return op.status.value === 'operation-active' &&
                         op.sourceAllocation._id.toString() === allocation._id.toString();
                }),
                cancelled: operations.filter((op) => {
                  return op.status.value === 'operation-cancelled' &&
                         op.sourceAllocation._id.toString() === allocation._id.toString();
                }),
              }
            });
            
            // allocations
            shipmentData.allocations = {
              active: allocations.filter((a) => {
                return a.status.value === 'allocation-active';
              }),
              cancelled: allocations.filter((a) => {
                return a.status.value === 'allocation-cancelled';
              }),
              finished: allocations.filter((a) => {
                return a.status.value === 'allocation-finished';
              }),
            };
            
            // standalone operations
            shipmentData.standaloneOperations = {
              active: [],
              cancelled: [],
            };
            
            res.json(shipmentData);
          })
          .catch(next);
          
      } else {
        res.json(shipment);
      }
    }
  );
  
  // TODO: auth
  // TODO: block update when shipment's status is at `in-progress`
  // TODO: move logic into cebola core
  /**
   * Updates a shipment
   * If the body has a `allocations` field,
   * will update allocations related to the shipment accordingly
   */
  app.put('/shipment/:shipmentId',
    bodyParser.json(),
    app.middleware.loadShipment(),
    function (req, res, next) {
      
      var shipment = req.shipment;
      
      var updatedShipmentData = req.body;
      
      return Bluebird.try(() => {
        // update the shipment's data
        shipment.set(updatedShipmentData);
        
        return shipment.save();
      })
      .then((updatedShipment) => {
        res.json(updatedShipment);
      })
      .catch(next);
      
    }
  );
  
  // TODO: auth
  /**
   * Cancels a shipment
   */
  app.delete('/shipment/:shipmentId',
    app.middleware.loadShipment(),
    function (req, res, next) {
      
      var shipment = req.shipment;
      
      return app.controllers.shipment.cancel(shipment)
        .then((shipment) => {
          res.json(shipment);
        })
        .catch(next);
      
    }
  );
  
  // TODO: auth
  app.post('/shipment/:shipmentId/finish',
    app.middleware.loadShipment(),
    bodyParser.json(),
    function (req, res, next) {
      
      var shipment = req.shipment;
      var observations = req.body.observations;
      
      return app.controllers.shipment.finish(shipment, observations)
        .then((shipment) => {
          res.json(shipment);
        })
        .catch(next);
    }
  );
  
  require('./allocation')(app, options);
  require('./operation')(app, options);
};
