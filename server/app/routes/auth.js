// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  const authCtrl = app.controllers.auth;

  app.post('/auth/token/generate',
    bodyParser.json(),
    function (req, res, next) {

      authCtrl.generateToken(
        req.body.email,
        req.body.password
      )
      .then((token) => {
        res.json({
          token: token,
        });
      })
      .catch(next);
    }
  );

  app.post('/auth/token/verify',
    app.middleware.authenticate(),
    function (req, res, next) {
      res.json(req.tokenData);
    }
  );
};
