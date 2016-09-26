const cebola = require('cebola');

module.exports = function (app, options) {


  var schemaMixins = {
    organization: require('../models/schema-mixins/organization')(app, options),
  }

  var cebolaSvc = cebola(
    app.services.mongoose.connection,
    {
      schemas: schemaMixins
    }
  );

  app.services.cebola = cebolaSvc;

};
