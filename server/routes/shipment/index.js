// third-party
const bodyParser = require('body-parser');
const Bluebird   = require('bluebird');

const aux = require('../../auxiliary');

module.exports = function (app, options) {

  app.post('/shipments/entries',
    app.middleware.authorize(),
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
  
  app.get('/shipments/entries',
    app.middleware.authorize(),
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

  app.post('/shipments/exits',
    app.middleware.authorize(),
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

  app.get('/shipments/exits',
    app.middleware.authorize(),
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

  /**
   * Retrieves a given shipment's data
   * Optionally returns all shipment records as well
   * 
   */
  app.get('/shipment/:shipmentId',
    app.middleware.authorize(),
    app.middleware.loadShipment(),
    function (req, res, next) {
      
      var withRecords = req.query.withRecords || true;
      
      var shipment = req.shipment;
      
      if (withRecords) {
        
        app.services.cebola.record.listByShipment(shipment, {
          loadFullProductSourceShipment: true
        })
        .then((records) => {
          var shipmentData = shipment.toJSON();
          
          // filter out allocations
          // and transform them into json objects
          // so that we may manipulate properties directly (w/out mongoose)
          var allocations = records.filter((record) => {
            return record.kind === 'ProductAllocation';
          })
          .map((allocationModel) => {
            return allocationModel;
          });
          
          // filter out operations
          var operations = records.filter((record) => {
            return record.kind === 'ProductOperation';
          })
          .map((operationModel) => {
            return operationModel;
          });
          
          // separate operations into allocations
          allocations.forEach((allocation) => {
            allocation.operations = {
              active: operations.filter((op) => {
                return op.status.value === 'operation-active' &&
                       op.sourceAllocation &&
                       op.sourceAllocation._id.toString() === allocation._id.toString();
              }),
              cancelled: operations.filter((op) => {
                return op.status.value === 'operation-cancelled' &&
                       op.sourceAllocation &&
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
            active: operations.filter((op) => {
              return op.status.value === 'operation-active' &&
                     (!op.sourceAllocation || !op.sourceAllocation._id);
            }),
            cancelled: operations.filter((op) => {
              return op.status.value === 'operation-cancelled' &&
                     (!op.sourceAllocation || !op.sourceAllocation._id);
            })
          };
          
          res.json(shipmentData);
        })
        .catch(next);
          
      } else {
        res.json(shipment);
      }
    }
  );
  
  // TODO: block update when shipment's status is at `in-progress`
  // TODO: move logic into cebola core
  /**
   * Updates a shipment
   * 'Allocations' are ignored.
   */
  app.put('/shipment/:shipmentId',
    app.middleware.authorize(),
    bodyParser.json(),
    app.middleware.loadShipment(),
    function (req, res, next) {
      var shipment = req.shipment;
      
      var updatedShipmentData = req.body;
      delete updatedShipmentData.allocations;

      var updateAllocationsPromise;

      // TODO: internalize behaviour into engine
      var updatedScheduledFor = updatedShipmentData.scheduledFor;

      if (updatedScheduledFor) {
        updateAllocationsPromise = app.controllers.allocation.listByShipment(shipment).then((allocations) => {
          return Bluebird.all((allocations.map((allocation) => {
            allocation.set('scheduledFor', updatedScheduledFor);

            return allocation.save();
          })));
        });
      } else {
        updateAllocationsPromise = Bluebird.resolve();
      }
      
      return updateAllocationsPromise.then(() => {
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
  
  /**
   * Cancels a shipment
   */
  app.delete('/shipment/:shipmentId',
    app.middleware.authorize(),
    app.middleware.loadShipment(),
    function (req, res, next) {
      
      var shipment = req.shipment;

      console.log(shipment);
      
      return app.controllers.shipment.cancel(shipment)
        .then((shipment) => {
          res.json(shipment);
        })
        .catch(next);
      
    }
  );
  
  app.post('/shipment/:shipmentId/finish',
    app.middleware.authorize(),
    app.middleware.loadShipment(),
    bodyParser.json(),
    function (req, res, next) {
      
      var shipment = req.shipment;
      
      return app.controllers.shipment.finish(shipment)
        .then((shipment) => {
          res.json(shipment);
        })
        .catch(next);
    }
  );
  
  require('./allocation')(app, options);
  require('./operation')(app, options);
};
