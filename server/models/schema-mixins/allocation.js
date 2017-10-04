module.exports = function (app, options) {

  return function (allocationSchema) {
    allocationSchema.add({
      'product.model.image': {
        filename: String,
        url: String,
        size: Number,
        mimetype: String,
      },
    });

    allocationSchema.pre('validate', function (next) {
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
