// third-party
const Bluebird = require('bluebird');

const aux = require('../auxiliary');

module.exports = function (app, options) {

  const cebola = app.services.cebola;

  const errors = app.errors;

  var ctrl = {};

  aux.proxyMethods(ctrl, cebola.productModel, [
    'create',
    'getById',
    // 'getBySKU',
    'list',
    'search',
  ]);
  
  return ctrl;

};
