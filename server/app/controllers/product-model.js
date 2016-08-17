// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const ProductModel = app.services.mongoose.models.ProductModel;

  const errors = app.errors;

  var productModelCtrl = {};

  productModelCtrl.create = function (data) {
    var productModel = new ProductModel(data);

    return productModel.save();
  };
  
  return productModelCtrl;

};
