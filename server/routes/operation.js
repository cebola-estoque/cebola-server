// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/operations/loss',
    bodyParser.json(),
    function (req, res, next) {

      var operationData = req.body;

      var product = operationData.product;
      var quantity = operationData.quantity;

      delete operationData.product;
      delete operationData.quantity;

      app.controllers.operation.registerLoss(product, quantity, operationData)
        .then((lossOperation) => {
          res.json(lossOperation);
        })
        .catch(next);
    }
  );

  app.post('/operations/correction',
    bodyParser.json(),
    function (req, res, next) {

      var operationData = req.body;

      var product = operationData.product;
      var quantity = operationData.quantity;

      delete operationData.product;
      delete operationData.quantity;

      app.controllers.operation.registerCorrection(product, quantity, operationData)
        .then((correctionOperation) => {
          res.json(correctionOperation);
        })
        .catch(next);
    }
  );

  app.get('/operations',
    function (req, res, next) {

      var query = req.query;

      app.controllers.operation.list(query)
        .then((operations) => {
          res.json(operations);
        })
        .catch(next);
    }
  );

};
