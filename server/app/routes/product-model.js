// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/product-models',
    app.middleware.authenticate(),
    bodyParser.json(),
    function (req, res, next) {

      var authorData = {
        _id: req.tokenData.sub,
        name: req.tokenData.name,
      };

      app.controllers.productModel.create(authorData, req.body)
        .then((productModel) => {
          res.json(productModel);
        })
        .catch(next);
    }
  );

  app.get('/product-models',
    app.middleware.authenticate(),
    function (req, res, next) {

      var searchQuery = req.query.q;

      var promise;

      if (searchQuery) {
        promise = app.controllers.productModel.search(searchQuery)
      } else {
        promise = app.controllers.productModel.list();
      }

      promise
        .then((productModels) => {
          res.json(productModels);
        })
        .catch(next);
    }
  );

};
