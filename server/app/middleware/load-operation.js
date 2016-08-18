// own
const aux = require('./auxiliary');

module.exports = function (app, options) {

  options = options || {};
  
  var _id = options.id || function (req) {
    return req.params.operationId;
  };

  var _as = options.as || 'operation';

  return function (req, res, next) {

    var id = aux.evalOpt(_id, req);
    var as = aux.evalOpt(_as, req);

    app.controllers.operation.getById(id)
      .then((operation) => {

        req[as] = operation;

        next();
      })
      .catch(next);
  };
};
