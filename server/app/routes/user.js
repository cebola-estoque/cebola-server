// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  const userCtrl = app.controllers.user;

  app.post('/users',
    bodyParser.json(),
    function (req, res, next) {

      userCtrl.create(
        req.body.email,
        req.body.password,
        req.body
      )
      .then((user) => {
        res.json({
          email: user.email,
          _id: user._id,
        });
      })
      .catch(next);
    }
  );

  app.get('/user/:userId',
    app.middleware.authenticate(),
    app.middleware.loadUser(),
    function (req, res, next) {

      // check that the loaded user is the same one as
      // the authenticated user
      if (req.user._id !== req.tokenData.sub) {
        next(new app.errors.Unauthorized());
        return;
      } else {

        res.json({
          _id: req.user._id,
          email: req.user.email,
        });
      }

    }
  );
};
