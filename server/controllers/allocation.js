// third-party
const Bluebird = require('bluebird');
const moment   = require('moment');

// constants

module.exports = function (app, options) {

  const cebola = app.services.cebola;

  const errors = app.errors;

  var ctrl = {};

  ctrl.listByShipment = function (shipment) {
    return cebola.allocation.listByShipment(shipment);
  };
  
  return ctrl;

};
