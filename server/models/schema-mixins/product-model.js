module.exports = function (app, options) {

  return function (productModelSchema) {
    productModelSchema.add({
      image: {
        filename: String,
        url: String,
        size: Number,
        mimetype: String,
      },

      categories: [{
        name: String,
      }],
    });

    /**
     * Normalize data before validation is run
     */
    productModelSchema.pre('validate', function (next) {
      /**
       * Ensure the categories is in UPPERCASE
       */
      if (this.categories && Array.isArray(this.categories)) {
        this.categories = this.categories.map((cat) => {
          if (typeof cat.name === 'string') {
            return {
              name: cat.name.toUpperCase(),
            };
          } else {
            return undefined;
          }
        })
        .filter((cat) => {
          return cat ? true : false;
        });

      } else {
        this.categories = [];
      }

      next();
    });

    productModelSchema.index({
      description: 'text',
    });
  };
};
