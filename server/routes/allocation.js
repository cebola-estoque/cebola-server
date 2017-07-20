// third-party
const bodyParser = require('body-parser');
const Bluebird   = require('bluebird');

module.exports = function (app, options) {
  
  // TODO: auth
  // TODO: block update when shipment's status is at `in-progress`
  // TODO: move logic into cebola core
  /**
   * Updates a shipment
   * If the body has a `allocations` field,
   * will update allocations related to the shipment accordingly
   */
  app.put('/allocation/:allocationId',
    bodyParser.json(),
    app.middleware.loadAllocation(),
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
  
  // // TODO: auth
  // app.post('/shipment/:shipmentId/cancel',
  //   app.middleware.loadShipment(),
  //   function (req, res, next) {
      
  //   }
  // );
  
  // app.post('/shipment/:shipmentId/allocate',
  //   app.middleware.loadShipment(),
  //   function (req, res, next) {
      
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
