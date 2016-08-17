// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const Record = app.services.mongoose.models.Record;

  const errors = app.errors;

  var inventoryCtrl = {};

  inventoryCtrl.computeSummary = function (query) {
    var aggregation = Record.aggregate();

    query = query || {};

    // // only products in stock
    query['quantity.value'] = { $gt: 0 };

    aggregation.match(query);

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
    });

    aggregation.project({
      _id: 0,
      productModel: 1,
      quantityValue: 1,
      quantityUnit: '$_id.quantityUnit',
      productExpiry: '$_id.productExpiry',
    });

    return aggregation.exec();
  };

  inventoryCtrl.computeProductSummary = function (productModel, organization) {

    var query = {};

    // scoped by organization and by productModel
    query['productModel._id'] = productModel._id.toString();
    query['invoice.toOrg._id'] = organization._id.toString();

    return inventoryCtrl.computeSummary(query);
  };

  inventoryCtrl.computeOrganizationSummary = function (organization) {

    var query = {};

    // scoped by organization
    query['invoice.toOrg._id'] = organization._id.toString();

    return inventoryCtrl.computeSummary(query);

  };

  // inventoryCtrl.computeOrgSummary = function (organization, query) {

  //   var aggregation = Record.aggregate();

  //   query = query || {};

  //   // scoped by organization and by productModel
  //   query['productModel._id'] = productModel._id.toString();
  //   query['invoice.toOrg._id'] = organization._id.toString();

  //   // // only products in stock
  //   query['quantity.value'] = { $gt: 0 };

  //   aggregation.match(query);

  //   aggregation.sort({
  //     productExpiry: -1,
  //   });

  //   aggregation.group({
  //     _id: {
  //       productModelId: '$productModel._id',
  //       productExpiry: '$productExpiry',
  //       quantityUnit: '$quantity.unit',
  //     },

  //     quantityValue: {
  //       $sum: '$quantity.value',
  //     },
  //   });

  //   aggregation.project({
  //     _id: 0,
  //     productModel: 1,
  //     quantityValue: 1,
  //     quantityUnit: '$_id.quantityUnit',
  //     productExpiry: '$_id.productExpiry',
  //   });

  //   return aggregation.exec();
  // }
  
  return inventoryCtrl;

};
