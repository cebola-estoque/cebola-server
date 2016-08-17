// third-party
const Bluebird = require('bluebird');
const SHARED_CONSTANTS = require('../../../shared/constants');

module.exports = function (app, options) {

  const Record = app.services.mongoose.models.Record;

  const errors = app.errors;

  var inventoryCtrl = {};

  inventoryCtrl.computeSummary = function (query) {
    var aggregation = Record.aggregate();

    query = query || {};

    // ensure only records with status set to
    // `effective` are taken into account
    query['status.value'] = SHARED_CONSTANTS.RECORD_STATUSES.EFFECTIVE;

    // match the aggregation query
    aggregation.match(query);

    // sort by productExpiry
    aggregation.sort({
      productExpiry: -1,
    });

    aggregation.group({
      _id: {
        productModelId: '$productModel._id',
        productExpiry: '$productExpiry',
        quantityUnit: '$quantity.unit',
      },

      quantityValue: {
        $sum: '$quantity.value',
      },

      productModel: {
        $last: '$productModel',
      },
    });

    // filter out productModels with quantity 0
    // ATTENTION: this `match` operation is purposely
    // run AFTER the grouping operation, so that
    // it matches against the results from the grouping phase
    aggregation.match({
      'quantityValue': { $gt: 0 }
    });

    // project the results to be returned as the LAST step
    aggregation.project({
      _id: 0,
      productModel: 1,
      'quantity.value': '$quantityValue',
      'quantity.unit': '$_id.quantityUnit',
      productExpiry: '$_id.productExpiry',
    });

    return aggregation.exec();
  };

  inventoryCtrl.computeOrgProductSummary = function (organization, productModel) {
    // ensure the orgId is in string format
    var orgId = organization._id.toString();

    var query = {};

    // scoped by organization
    query['$or'] = [
      { 'invoice.destination._id': orgId },
      { 'invoice.source._id': orgId }
    ];

    query['productModel._id'] = productModel._id.toString();

    return inventoryCtrl.computeSummary(query);
  };

  inventoryCtrl.computeOrgSummary = function (organization) {

    // ensure the orgId is in string format
    var orgId = organization._id.toString();

    var query = {};

    // scoped by organization
    query['$or'] = [
      { 'invoice.destination._id': orgId },
      { 'invoice.source._id': orgId }
    ];
    
    return inventoryCtrl.computeSummary(query);

  };
  
  return inventoryCtrl;

};
