// third-party
const cebola = require('cebola');
const Bluebird = require('bluebird');

module.exports = function (app, options) {


  var schemaMixins = {
    allocation: require('../models/schema-mixins/allocation')(app, options),
    operation: require('../models/schema-mixins/operation')(app, options),
    shipment: require('../models/schema-mixins/shipment')(app, options),
    organization: require('../models/schema-mixins/organization')(app, options),
    productModel: require('../models/schema-mixins/product-model')(app, options),
  };

  var cebolaSvc = cebola(
    app.services.mongoose.connection,
    {
      schemas: schemaMixins
    }
  );

  return Bluebird.resolve(cebolaSvc);
};
