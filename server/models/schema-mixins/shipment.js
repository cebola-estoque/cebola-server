module.exports = function (app, options) {

  return function (shipmentSchema) {

    shipmentSchema.add({
      documents: {
        NF: String,
        CDE: String,
        vehicleId: String,
      },

      annotations: {
        type: String,
      }
    });

  };
};
