// third-party
const Bluebird = require('bluebird');
const moment   = require('moment');

const aux = require('../auxiliary');

// constants

module.exports = function (app, options) {

  const cebola = app.services.cebola;

  const errors = app.errors;

  var ctrl = {};

  aux.proxyMethods(ctrl, cebola.operation, [
    'list',
    'listByProduct',
    'listByShipment',
    'registerEntry',
    'registerExit',
    'registerLoss',
    'registerCorrection',
    'cancel',
  ]);
  
  return ctrl;

};
