// third-party
const Bluebird = require('bluebird');
const moment   = require('moment');

const aux = require('../auxiliary');

// constatns
// const SHARED_CONSTANTS = require('../../../shared/constants');

module.exports = function (app, options) {

  const cebola = app.services.cebola;

  const errors = app.errors;

  var ctrl = {};
  
  aux.proxyMethods(ctrl, cebola.inventory, [
    'summary',
    'shipmentSummary',
    'productSummary',
    'availabilitySummary',
    'productAvailability',
    'isProductAvailable',
    'isProductInStock',
  ]);

  return ctrl;

};
