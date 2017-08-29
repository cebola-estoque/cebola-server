module.exports = function (app, options) {

  return function (operationSchema) {
    operationSchema.add({
      'product.model.image': {
        filename: String,
        url: String,
        size: Number,
        mimetype: String,
      }
    });
  };
};
