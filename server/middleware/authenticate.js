// third-party
const Bluebird   = require('bluebird');
const expressJwt = require('express-jwt');

module.exports = function (app, options) {

  /**
   * Secrets are loaded from app options
   */
  const SECRET = app.APP_OPTIONS.secret;
  const TEMPORARY_SECRET = app.APP_OPTIONS.temporarySecret;

  options = options || {};

  const verifyRoles = options.verifyRoles || false;

  const BEARER_TOKEN_RE = /^Bearer\s+(.+)/;

  function parseToken(req) {
    var authorizationHeader = req.header('Authorization');

    if (!authorizationHeader) { return false; }

    var match = authorizationHeader.match(BEARER_TOKEN_RE);

    if (!match) {
      return false;
    } else {
      return match[1];
    } 
  }

  return expressJwt({
    secret: TEMPORARY_SECRET
  });

  // return function (req, res, next) {
  //   var token = parseToken(req);

  //   if (!token) {
  //     next(new app.errors.Unauthorized());
  //     return;
  //   }

  //   app.controllers.auth.verifyToken(token)
  //     .then(function (decoded) {
        
  //       // make the user data available to middleware after
  //       req.tokenData = decoded;

  //       if (verifyRoles) {
  //         // load the user and verify the roles

  //         return app.controllers.user.getById(decoded.sub)
  //           .then((user) => {
  //             if (!user) {
  //               return Bluebird.reject(new app.errors.Unauthorized());
  //             }

  //             var userHasRoles = user.verifyRoles(verifyRoles);

  //             if (!userHasRoles) {
  //               return Bluebird.reject(new app.errors.Unauthorized());
  //             } else {
  //               return true;
  //             }
  //           })

  //       } else {
  //         return true;
  //       }

  //     })
  //     .then(() => {
  //       next();
  //     })
  //     .catch(next);
  // };
};
