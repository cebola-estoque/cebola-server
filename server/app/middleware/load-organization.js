// own
const aux = require('./auxiliary');

module.exports = function (app, options) {

  options = options || {};
  
  var _id = options.id || function (req) {
    return req.params.organizationId;
  };

  var _as = options.as || 'organization';

  return function (req, res, next) {

    var id = aux.evalOpt(_id, req);
    var as = aux.evalOpt(_as, req);

    app.controllers.organization.getById(id)
      .then((organization) => {

        req[as] = organization;

        next();
      })
      .catch(next);
  };
};
