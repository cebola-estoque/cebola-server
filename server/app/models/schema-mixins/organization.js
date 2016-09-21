module.exports = function (app, options) {

  return function (organizationSchema) {

    organizationSchema.add({
      CDE: {
        type: String,
      }
    });
    
    organizationSchema.index({
      name: 'text',
    });
  };
};
