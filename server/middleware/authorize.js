// third-party
const Bluebird   = require('bluebird');
const expressJwt = require('express-jwt');

module.exports = function (app, options) {

  return function (req, res, next) {

    console.log(`Authorize request for ${req.path}`);

    next();
  };
};
