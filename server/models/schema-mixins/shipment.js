module.exports = function (app, options) {

  return function (shipmentSchema) {
    shipmentSchema.add({
      author: {
        name: {
          type: String,
          required: true,
        },
        _id: {
          type: String,
          required: true,
        }
      }
    });
  };
};
