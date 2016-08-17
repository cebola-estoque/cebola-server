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

    record.set('author', author);
    record.set('type', RECORD_TYPES.ENTRY);

    record.set('invoice', {
      _id: invoice._id,
      source: invoice.source,
      destination: invoice.destination
    });

    record.setStatus(RECORD_STATUSES.SCHEDULED, 'UserScheduled');

    return record.save();
  };

  recordCtrl.scheduleExit = function (author, invoice, recordData) {

    var record = new Record(recordData);

    record.set('author', author);
    record.set('type', RECORD_TYPES.EXIT);

    record.set('invoice', {
      _id: invoice._id,
      source: invoice.source,
      destination: invoice.destination
    });

    record.setStatus(RECORD_STATUSES.SCHEDULED, 'UserScheduled');

    return record.save();
  };

  recordCtrl.effectivate = function (author, record) {
    if (!(record instanceof Record)) {
      return Bluebird.reject(new errors.InvalidOption('record', 'typeerror'));
    }

    record.newVersion();

    record.set('author', author);
    record.setStatus(RECORD_STATUSES.EFFECTIVE, 'UserEffectivated');

    return record.save();
  };

  recordCtrl.cancel = function (author, record) {

    // save current version to the history
    record.newVersion();

    record.set('author', author);
    record.setStatus(RECORD_STATUSES.CANCELLED, 'UserCancelled');

    return record.save();
  };

  recordCtrl.registerLoss = function (author, invoice, recordData) {
    var record = new Record(recordData);

    record.set('author', author);
    record.set('type', RECORD_TYPES.LOSS);

    record.set('invoice', {
      _id: invoice._id,
      source: invoice.source,
      destination: invoice.destination
    });
    
    record.setStatus(RECORD_STATUSES.SCHEDULED, 'UserRegistered');

    return record.save();
  };

  recordCtrl.getByInvoiceId = function (invoiceId) {
    return Record.find({
      'invoice._id': invoiceId,
    });
  };
  
  return recordCtrl;

};
