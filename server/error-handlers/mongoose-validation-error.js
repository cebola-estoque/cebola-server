// third-party
const mongoose = require('mongoose');
const ValidationError = mongoose.Error.ValidationError;

module.exports = function (app, options) {

  app.use(function (err, req, res, next) {
    if (err instanceof ValidationError) {
      res.status(400).json(err);
    } else {
      next(err);
    }
  });
};
