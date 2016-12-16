// own
const aux = require('./auxiliary');

module.exports = function (app, options) {

  options = options || {};
  
  var _id = options.id || function (req) {
    return req.params.allocationId;
  };

  var _as = options.as || 'allocation';

  return function (req, res, next) {

    var id = aux.evalOpt(_id, req);
    var as = aux.evalOpt(_as, req);

    app.controllers.allocation.getById(id)
      .then((allocation) => {
        
        console.log('ALLOCATION', allocation)

        req[as] = allocation;

        next();
      })
      .catch(next);
  };
};
