// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  const authCtrl = app.controllers.auth;

  app.post('/temporary-token/generate',
    bodyParser.json(),
    function (req, res, next) {
      authCtrl.generateTemporaryToken(
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
};
