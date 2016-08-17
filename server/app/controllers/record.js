// third-party
const Bluebird = require('bluebird');
const moment   = require('moment');

// constants
const SHARED_CONSTANTS = require('../../../shared/constants');
const RECORD_TYPES = SHARED_CONSTANTS.RECORD_TYPES;
const RECORD_STATUSES = SHARED_CONSTANTS.RECORD_STATUSES;

module.exports = function (app, options) {

  const Organization = app.services.mongoose.models.Organization;
  const Invoice      = app.services.mongoose.models.Invoice;
  const Record       = app.services.mongoose.models.Record;

  const errors = app.errors;

  var recordCtrl = {};

  recordCtrl.scheduleEntry = function (author, invoice, recordData) {

    var record = new Record(recordData);

    record.set('type', RECORD_TYPES.ENTRY);

    record.setAuthor(author);
    record.setInvoice(invoice);

    record.setStatus(RECORD_STATUSES.SCHEDULED, 'UserScheduled');

    return record.save();
  };

  recordCtrl.scheduleExit = function (author, invoice, recordData) {

    /**
     * TODO:
     * 
     * First check if there
     * are enough items to be scheduled for exit
     */
    return app.controllers.inventory.computeOrgProductAvailability(
      invoice.source,
      recordData.productModel,
      recordData.productExpiry,
      recordData.quantity
    )
    .then((availability) => {

      var record = new Record(recordData);

      record.set('type', RECORD_TYPES.EXIT);

      record.setAuthor(author);
      record.setInvoice(invoice);

      record.setStatus(RECORD_STATUSES.SCHEDULED, 'UserScheduled');

      return record.save();
    });
  };

  recordCtrl.effectivate = function (author, record) {
    if (!(record instanceof Record)) {
      return Bluebird.reject(new errors.InvalidOption('record', 'typeerror'));
    }

    record.newVersion();

    record.setAuthor(author);
    record.setStatus(RECORD_STATUSES.EFFECTIVE, 'UserEffectivated');

    return record.save();
  };

  recordCtrl.cancel = function (author, record) {

    // save current version to the history
    record.newVersion();

    record.setAuthor(author);
    record.setStatus(RECORD_STATUSES.CANCELLED, 'UserCancelled');

    return record.save();
  };

  recordCtrl.correct = function (author, record, correction) {

    // save current version to the history
    record.newVersion();

    record.setAuthor(author);

    // TODO: implement fields that may be corrected
    throw new Error('not yet implemented');

    return record.save();
  };

  recordCtrl.registerLoss = function (author, invoice, recordData) {
    /**
     * TODO:
     * 
     * First check if there
     * are enough items to be scheduled for exit
     */

    var record = new Record(recordData);

    record.set('type', RECORD_TYPES.LOSS);

    record.setAuthor(author);
    record.setInvoice(invoice);
    
    record.setStatus(RECORD_STATUSES.SCHEDULED, 'UserRegistered');

    return record.save();
  };

  recordCtrl.listByInvoiceId = function (invoiceId) {
    return Record.find({
      'invoice._id': invoiceId,
    });
  };
  
  return recordCtrl;

};
