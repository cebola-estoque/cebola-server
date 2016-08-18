// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const Shipment = app.services.mongoose.models.Shipment;

  const errors = app.errors;

  var ctrl = {};

  ctrl.create = function (author, organization, data) {
    var shipment = new Shipment(data);

    shipment.set('author', {
      _id: author._id,
      name: author.name,
    });

    shipment.set('organization', {
      _id: organization._id,
      name: organization.name,
    });

    return shipment.save();
  };

  ctrl.getById = function (id) {
    return Shipment.findOne({
      _id: id,
    })
    .then((shipment) => {
      if (!shipment) {
        return Bluebird.reject(new errors.NotFound('shipment', id));
      } else {
        return shipment;
      }
    });
  };

  return ctrl;

};
