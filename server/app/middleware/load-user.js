// own
const aux = require('./auxiliary');

module.exports = function (app, options) {

  options = options || {};

  var _id = options.id || function (req) {
    return req.params.userId;
  };

  var _as = options.as || 'user';

  return function (req, res, next) {

    var id = aux.evalOpt(_id, req);
    var as = aux.evalOpt(_as, req);

    app.controllers.user.getById(id)
      .then((user) => {

        req[as] = user;

        next();
      })
      .catch(next);
  };
};
