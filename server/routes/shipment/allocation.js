// third-party
const bodyParser = require('body-parser');
const Bluebird   = require('bluebird');

module.exports = function (app, options) {
  
  // TODO: auth
  /**
   * Batch creates allocations for the given shipment
   */
  app.post('/shipment/:shipmentId/allocations',
    app.middleware.loadShipment(),
    bodyParser.json(),
    function (req, res, next) {
      
      var shipment = req.shipment;
      var allocationsToCreate = req.body;
      
      if (!allocationsToCreate || !Array.isArray(allocationsToCreate)) {
        next(new app.errors.InvalidOption('allocationsToCreate', 'required'));
        return;
      }
      
      return Bluebird.all(allocationsToCreate.map((toCreate) => {
        
        // TODO: create allocate method on allocation controller
        // that will choose the correct allocation type
        if (shipment.type === 'entry') {
          return app.controllers.allocation.allocateEntry(
            shipment,
            toCreate.product,
            toCreate.allocatedQuantity
          );
        } else if (shipment.type === 'exit') {
          return app.controllers.allocation.allocateExit(
            shipment,
            toCreate.product,
            toCreate.allocatedQuantity
          );
        }
        
      }))
      .then((allocations) => {
        res.json(allocations);
      })
      .catch(next);
      
    }
  );
  
  app.get('/shipment/:shipmentId/allocations',
    function (req, res, next) {
      
    }
  );
  
  // TODO: auth
  /**
   * Batch updates allocations
   */
  app.put('/shipment/:shipmentId/allocations',
    app.middleware.loadShipment(),
    bodyParser.json(),
    function (req, res, next) {
      
      var shipment = req.shipment;
      var allocationsToUpdate = req.body;
      
      if (!allocationsToUpdate || !Array.isArray(allocationsToUpdate)) {
        next(new app.errors.InvalidOption('allocationsToUpdate', 'required'));
        return;
      }
      
      return app.controllers.allocation.listByShipment(shipment)
        .then((allocations) => {
          
          return Bluebird.all(allocationsToUpdate.map((toUpdate) => {
            
            var alloc = allocations.find((a) => {
              return a._id.toString() === toUpdate._id;
            })
            
            if (alloc) {
              
              console.log(toUpdate);
              
              // TODO: filter out non-updatable properties
              alloc.set(toUpdate);
              
              console.log(alloc.get('quantity'));
              
              return alloc.save();
            }
            
          }));
          
        })
        .then((updatedAllocations) => {
          res.json(updatedAllocations);
        })
        .catch(next);
      
    }
  );
  
  // TODO: auth
  /**
   * Batch cancels allocations related to the shipment
   */
  app.delete('/shipment/:shipmentId/allocations',
    app.middleware.loadShipment(),
    bodyParser.json(),
    function (req, res, next) {
      
      var shipment = req.shipment;
      var allocationsToCancel = req.body;
      
      console.log(req.body);
      
      if (!allocationsToCancel || !Array.isArray(allocationsToCancel)) {
        next(new app.errors.InvalidOption('allocationsToCancel', 'required'));
        return;
      }
      
      return app.controllers.allocation.listByShipment(shipment)
        .then((allocations) => {
          
          return Bluebird.all(allocationsToCancel.map((toCancel) => {
            
            var toCancelId = typeof toCancel === 'string' ?
              toCancel : toCancel._id;
            
            var alloc = allocations.find((a) => {
              return a._id.toString() === toCancelId;
            });
            
            return app.controllers.allocation.cancel(alloc, 'UserCancelled');
          }));
          
        })
        .then((updatedAllocations) => {
          res.json(updatedAllocations);
        })
        .catch(next);
      
    }
  );
  
  /**
   * Effectivates an allocation
   */
  app.post('/shipment/:shipmentId/allocation/:allocationId/effectivate',
    app.middleware.loadShipment(),
    app.middleware.loadAllocation(),
    bodyParser.json(),
    function (req, res, next) {
      
      var shipment = req.shipment;
      var allocation = req.allocation;
      var allocationType = allocation.type;
      
      var quantity = req.body.quantity;
      
      var effectivatePromise;
      
      if (allocationType === 'entry') {
        effectivatePromise = app.controllers.allocation.effectivateEntry(
          allocation,
          quantity
        );
      } else if (allocationType === 'exit') {
        effectivatePromise = app.controllers.allocation.effectivateExit(
          allocation,
          quantity
        );
      } else {
        effectivatePromise = Bluebird.reject(new app.errors.InvalidOption('invalid allocation type'));
      }
      
      return effectivatePromise.then((operation) => {
        res.json(operation);
      })
      .catch(next);
      
    }
  );
  
};
