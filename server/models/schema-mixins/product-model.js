module.exports = function (app, options) {

  return function (productModelSchema) {
    productModelSchema.add({
      image: {
        filename: String,
        url: String,
        size: Number,
        mimetype: String,
      }
    });

    productModelSchema.index({
      description: 'text',
    });
  };
};
