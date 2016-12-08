// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {
  
  /**
   * Creates a product model
   * TODO: auth
   */
  app.post('/product-models',
    bodyParser.json(),
    function (req, res, next) {

      app.controllers.productModel.create(req.body)
        .then((productModel) => {
          res.json(productModel);
        })
        .catch(next);
    }
  );

  /**
   * Retrieves a list of product models
   * TODO: auth
   */
  app.get('/product-models',
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
  
  /**
   * TODO: auth
   */
  app.put('/product-model/:productModelId',
    app.middleware.loadProductModel({}),
    bodyParser.json(),
    function (req, res, next) {
      var productModel = req.productModel;
      var productModelData = req.body;
      
      productModel.set(productModelData);
      
      return productModel.save().then((productModel) => {
        res.json(productModel);
      })
      .catch(next);
    }
  );
  
  /**
   * Deletes a product model.
   * TODO: auth
   */
  app.delete('/product-model/:productModelId',
    app.middleware.loadProductModel({}),
    bodyParser.json(),
    function (req, res, next) {
      
      var productModel = req.productModel;
      
      return productModel.remove().then(() => {
        // TODO: check correct status code
        res.status(204).end();
      })
      .catch(next);
    }
  );

};
