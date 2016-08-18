// own
const aux = require('./auxiliary');

module.exports = function (app, options) {

  options = options || {};
  
  var _id = options.id || function (req) {
    return req.params.productModelId;
  };

  var _as = options.as || 'productModel';

  return function (req, res, next) {

    var id = aux.evalOpt(_id, req);
    var as = aux.evalOpt(_as, req);

    app.controllers.productModel.getById(id)
      .then((productModel) => {

        req[as] = productModel;

        next();
      })
      .catch(next);
  };
};
