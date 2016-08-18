// own
const aux = require('./auxiliary');

module.exports = function (app, options) {

  options = options || {};
  
  var _id = options.id || function (req) {
    return req.params.shipmentId;
  };

  var _as = options.as || 'shipment';

  return function (req, res, next) {

    var id = aux.evalOpt(_id, req);
    var as = aux.evalOpt(_as, req);

    app.controllers.shipment.getById(id)
      .then((shipment) => {

        req[as] = shipment;

        next();
      })
      .catch(next);
  };
};
