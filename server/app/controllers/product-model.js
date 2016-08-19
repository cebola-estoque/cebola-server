// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const ProductModel = app.services.mongoose.models.ProductModel;

  const errors = app.errors;

  var ctrl = {};

  ctrl.create = function (user, data) {
    var productModel = new ProductModel(data);

    productModel.set('author', {
      _id: user._id.toString(),
      name: user.name,
    });

    return productModel.save();
  };

  ctrl.getById = function (id) {
    return ProductModel.findOne({
      _id: id,
    })
    .then((productModel) => {
      if (!productModel) {
        return Bluebird.reject(new errors.NotFound('productModel', id));
      } else {
        return productModel;
      }
    });
  };

  ctrl.list = function () {
    return ProductModel.find();
  };

  ctrl.search = function (queryText) {
    return ProductModel.find({
      $text: {
        $search: queryText,
      }
    }, {
      score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta : 'textScore' } })
    .exec();
  };
  
  return ctrl;

};
