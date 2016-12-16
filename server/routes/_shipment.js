// third-party
const bodyParser = require('body-parser');
const Bluebird   = require('bluebird');

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
      
      console.log('create entry shipment', supplier, shipmentData, allocations);
      
      app.controllers.shipment
        .scheduleEntry(supplier, req.body, allocations)
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
            
            shipmentData.allocations = records.filter((record) => {
              return record.kind === 'ProductAllocation';
            });
            
            shipmentData.operations = records.filter((record) => {
              return record.kind === 'ProductOperation';
            });
            
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
      
      // allocations must be updated separately
      var updatedAllocations  = updatedShipmentData.allocations || [];
      delete updatedShipmentData.allocations;
      
      var allocationsToRemove = updatedAllocations.filter((allocation) => {
        return allocation._id && allocation.$remove === true;
      });
      
      var allocationsToUpdate = updatedAllocations.filter((allocation) => {
        return allocation._id && allocation.$update === true;
      });
      
      var allocationsToCreate = updatedAllocations.filter((allocation) => {
        return allocation.$create === true;
      });
      
      return app.services.cebola.record.listByShipment(shipment)
        .then((records) => {
          // remove allocations marked for removal
          var allocRemovePromise = Bluebird.all(
            allocationsToRemove.map((alloc) => {
              var allocationRecord = records.find((r) => {
                return r._id.toString() === alloc._id;
              });
              
              if (allocationRecord) {
                return allocationRecord.remove();
              }
            })
          );
          
          // update allocations marked for update
          var allocUpdatePromise = Bluebird.all(
            allocationsToUpdate.map((alloc) => {
              var allocationRecord = records.find((r) => {
                return r._id.toString() === alloc._id;
              });
              
              if (allocationRecord) {
                allocationRecord.set(alloc);
                return allocationRecord.save();
              }
            })
          );
          
          // create allocations marked for creation
          var allocCreatePromise = Bluebird.all(
            allocationsToCreate.map((alloc) => {
              return 
            })
          );
          
        })
        .then(() => {
          // update the shipment's data
          shipment.set(updatedShipmentData);
          
          return shipment.save();
        })

      
      console.log(shipment);
      
    }
  );
  
  // TODO: auth
  app.post('/shipment/:shipmentId/cancel',
    app.middleware.loadShipment(),
    function (req, res, next) {
      
    }
  );
  
  // TODO: auth
  /**
   * Creates allocations for the given shipment
   */
  app.post('/shipment/:shipmentId/allocations',
    app.middleware.loadShipment(),
    function (req, res, next) {
      
    }
  );
  
  // TODO: auth
  /**
   * Removes allocationd from the given shipment
   */
  app.delete('/shipment/:shipmentId/allocation/:allocationId',
    app.middleware.loadShipment(),
    app.middleware.loadAllocation(),
    function (req, res, next) {
      
    }
  );
  
  // TODO: auth
  /**
   * Updates allocation
   */
  app.put('/shipment/:shipmentId/allocation/:allocationId',
    app.middleware.loadShipment(),
    app.middleware.loadAllocation(),
    function (req, res, next) {
      
    }
  );

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
