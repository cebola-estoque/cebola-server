module.exports = function (app, options) {

  return function (organizationSchema) {

    organizationSchema.add({
      legalName: String, // Razão social
    });
    
    organizationSchema.index({
      name: 'text',
    });
  };
};
