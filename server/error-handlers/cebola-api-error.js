module.exports = function (app, options) {

  const errors = app.errors;

  app.use(function (err, req, res, next) {

    console.warn(err);

    if (err instanceof errors.CebolaAPIError) {

      switch (err.name) {
        case 'InvalidOption':
          res.status(400).json(err);
          break;
        case 'Unauthorized':
          res.status(401).json(err);
          break;
        case 'ProductNotAvailable':
          res.status(400).json(err);
          break;
        default:
          next(err);
          break;
      }

    } else {
      next(err);
    }
  });
};
