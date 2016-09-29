// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const cebola = app.services.cebola;

  const errors = app.errors;

  var ctrl = {};

  ctrl.scheduleEntry = function (author, supplier, shipmentData, allocationsData) {

    if (!author) {
      return new errors.InvalidOption('author', 'required');
    }

    shipmentData.author = {
      _id: author._id,
      name: author.name,
    };

    return cebola.shipment.scheduleEntry(supplier, shipmentData, allocationsData);
  };

  ctrl.scheduleExit = function (author, supplier, shipmentData, allocationsData) {

    if (!author) {
      return new errors.InvalidOption('author', 'required');
    }

    shipmentData.author = {
      _id: author._id,
      name: author.name,
    };

    return cebola.shipment.scheduleExit(supplier, shipmentData, allocationsData);
  };

  ctrl.list = function (query) {
    return cebola.shipment.list(query);
  };

  ctrl.getById = function (shipmentId, options) {
    return cebola.shipment.getById(shipmentId, options);
  };

  ctrl.getSummary = function (shipment) {
    return cebola.shipment.getSummary(shipment);
  };

  // ctrl.create = function (author, data) {
  //   var shipment = new Shipment(data);

  //   shipment.set('author', {
  //     _id: author._id,
  //     name: author.name,
  //   });

  //   return shipment.save();
  // };

  // ctrl.createWithOperations = function (author, data, operations) {
  //   ctrl
  //     .create(author, req.body)
  //     .then((shipment) => {

  //       return app.controllers.operation
  //         .scheduleOperations(
  //           authorData,
  //           shipment,
  //           operations
  //         );
  //     })
  //     .catch((err) => {

  //       // 

  //     });
  // };

  // // ctrl.

  // ctrl.getById = function (id) {
  //   return Shipment.findOne({
  //     _id: id,
  //   })
  //   .then((shipment) => {
  //     if (!shipment) {
  //       return Bluebird.reject(new errors.NotFound('shipment', id));
  //     } else {
  //       return shipment;
  //     }
  //   });
  // };

  // ctrl.list = function () {
  //   return Shipment.find();
  // };

  return ctrl;

};
