module.exports = function (app, options) {

  return function (operationSchema) {
    operationSchema.add({
      'product.model.image': {
        filename: String,
        url: String,
        size: Number,
        mimetype: String,
      },

      annotations: {
        type: String,
      }
    });

    operationSchema.pre('validate', function (next) {
      /**
       * Set default product.unitPrice.currency
       */
      this.product = this.product || {};
      this.product.unitPrice = this.product.unitPrice || {};
      this.product.unitPrice.currency = this.product.unitPrice.currency || 'BRL';

      next();
    });
  };
};
