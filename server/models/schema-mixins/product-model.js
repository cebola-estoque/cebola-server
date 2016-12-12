module.exports = function (app, options) {

  return function (productModelSchema) {
    productModelSchema.index({
      description: 'text',
    });
  };
};
