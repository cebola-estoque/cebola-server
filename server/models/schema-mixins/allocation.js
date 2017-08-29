module.exports = function (app, options) {

  return function (allocationSchema) {
    allocationSchema.add({
      'product.model.image': {
        filename: String,
        url: String,
        size: Number,
        mimetype: String,
      }
    });
  };
};
