// third-party
const Bluebird = require('bluebird');
const moment   = require('moment');

// constants
const SHARED_CONSTANTS = require('../../../shared/constants');
const RECORD_TYPES = SHARED_CONSTANTS.RECORD_TYPES;
const RECORD_STATUSES = SHARED_CONSTANTS.RECORD_STATUSES;

module.exports = function (app, options) {

  const Organization = app.services.mongoose.models.Organization;
  const Shipment     = app.services.mongoose.models.Shipment;
  const Operation    = app.services.mongoose.models.Operation;

  const errors = app.errors;

  var ctrl = {};

  ctrl.getById = function (id) {
    return Operation.findOne({
      _id: id,
    })
    .then((operation) => {
      if (!operation) {
        return Bluebird.reject(new errors.NotFound('operation', id));
      } else {
        return operation;
      }
    });
  };

  ctrl.scheduleEntry = function (author, operationData) {

    var operation = new Operation(operationData);

    operation.set('type', RECORD_TYPES.ENTRY);

    operation.setAuthor(author);
    operation.setStatus(RECORD_STATUSES.SCHEDULED, 'UserScheduled');

    return operation.save();
  };

  ctrl.scheduleExit = function (author, operationData) {

    /**
     * First check if there
     * are enough items to be scheduled for exit
     */
    return app.controllers.inventory.computeOrgProductAvailability(
      operationData.productModel,
      operationData.productExpiry,
      operationData.quantity
    )
    .then((availability) => {

      var operation = new Operation(operationData);

      operation.set('type', RECORD_TYPES.EXIT);

      operation.setAuthor(author);

      operation.setStatus(RECORD_STATUSES.SCHEDULED, 'UserScheduled');

      return operation.save();
    });
  };

  ctrl.effectivate = function (author, operation, correctionData) {
    if (!(operation instanceof Operation)) {
      return Bluebird.reject(new errors.InvalidOption('operation', 'typeerror'));
    }

    operation.newVersion();

    operation.setAuthor(author);
    if (correctionData) {
      operation.correct(correctionData);
    }
    operation.setStatus(RECORD_STATUSES.EFFECTIVE, 'UserEffectivated');

    return operation.save();
  };

  ctrl.cancel = function (author, operation) {

    // save current version to the history
    operation.newVersion();

    operation.setAuthor(author);
    operation.setStatus(RECORD_STATUSES.CANCELLED, 'UserCancelled');

    return operation.save();
  };

  ctrl.correct = function (author, operation, correctionData) {

    // save current version to the history
    operation.newVersion();

    operation.setAuthor(author);
    operation.correct(correctionData);

    return operation.save();
  };

  ctrl.registerLoss = function (author, operationData) {
    /**
     * First check if there
     * are enough items to be scheduled for loss
     */
    return app.controllers.inventory.computeOrgProductAvailability(
      operationData.productModel,
      operationData.productExpiry,
      operationData.quantity
    )
    .then((availability) => {

      var operation = new Operation(operationData);

      operation.set('type', RECORD_TYPES.LOSS);

      operation.setAuthor(author);
      
      operation.setStatus(RECORD_STATUSES.SCHEDULED, 'UserRegistered');

      return operation.save();
    })
  };

  ctrl.listByShipmentId = function (shipmentId) {
    return Operation.find({
      'shipment._id': shipmentId,
    });
  };
  
  return ctrl;

};
