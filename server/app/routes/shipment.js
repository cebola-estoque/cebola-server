// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/shipments',
    app.middleware.authenticate(),
    bodyParser.json(),
    function (req, res, next) {

      app.controllers.create(req.tokenData, req.organization, req.body)
        .then((shipment) => {
          res.json({
            _id: shipment._id,
          });
        })
        .catch(next);
    }
  );

  app.get('/shipments',
    app.middleware.authenticate(),
    function (req, res, next) {

      app.controllers.shipment.list()
        .then((shipments) => {
          res.json(shipments);
        })
        .catch(next);
    }
  );

};
