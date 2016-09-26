// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const cebola = app.services.cebola;

  const errors = app.errors;

  var ctrl = {};

  ctrl.create = function (data) {
    return cebola.productModel.create(data);
  };

  ctrl.getById = function (id) {
    return cebola.productModel.getById(id);
  };
  
  ctrl.list = function () {
    return cebola.productModel.list();
  };
  
  ctrl.search = function (queryText) {
    return cebola.productModel.search(queryText);
  };
  
  return ctrl;

};
