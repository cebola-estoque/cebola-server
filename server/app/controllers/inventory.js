// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const InventoryEntry = app.services.mongoose.models.InventoryEntry;

  const errors = app.errors;

  var inventoryCtrl = {};

  inventoryCtrl.countProduct = function (product) {

  };

  inventoryCtrl.countProductInLots = function (product, lots) {

  };
  
  return inventoryCtrl;

};
