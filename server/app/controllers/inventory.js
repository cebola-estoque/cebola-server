// third-party
const Bluebird = require('bluebird');
const moment   = require('moment');

// constatns
const SHARED_CONSTANTS = require('../../../shared/constants');

module.exports = function (app, options) {

  const Operation = app.services.mongoose.models.Operation;

  const errors = app.errors;

  var ctrl = {};

  ctrl.computeSummary = function (query) {
    var aggregation = Operation.aggregate();

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

  ctrl.search = function (textQuery) {
    return ctrl.computeSummary({
      $text: {
        $search: textQuery,
      }
    });
  };

  ctrl.computeOrgProductSummary = function (productModel, query) {

    query = query || {};

    query['productModel._id'] = productModel._id.toString();

    return ctrl.computeSummary(query);
  };

  ctrl.computeOrgSummary = function (query) {
    query = query || {};
    
    return ctrl.computeSummary(query);

  };

  ctrl.computeOrgProductAvailability = function (productModel, productExpiry, requestedQuantity) {

    // normalize the product expiry to the end of the day
    // convert the moment.js date into a native JS Date
    productExpiry = moment(productExpiry).endOf('day').toDate();

    return ctrl.computeOrgProductSummary(productModel, {
      productExpiry: productExpiry,
      'quantity.unit': requestedQuantity.unit,
    })
    .then((summaryResults) => {

      if (summaryResults.length === 0) {
        return Bluebird.reject(new errors.ProductNotAvailable());
      }

      if (summaryResults[0].quantity.value > Math.abs(requestedQuantity.value)) {
        return {
          available: true,
          summary: summaryResults[0],
        };
      } else {
        return Bluebird.reject(new errors.ProductNotAvailable());
      }
    })
  };
  
  return ctrl;

};
