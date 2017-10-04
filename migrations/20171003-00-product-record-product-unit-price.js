// internal dependencies
const pkg = require('../package.json');
const createCebolaAPI = require('../server');

module.exports.do = function (appOptions, migrationOptions) {
  // instantiate the app
  var app = createCebolaAPI(appOptions);

  return app.ready.then(() => {

    var ProductRecord = app.services.cebola.models.ProductRecord;

    var query = {
      'product.unitPrice': {
        $exists: false,
      }
    };

    var update = {
      $set: {
        'product.unitPrice.value': 0,
        'product.unitPrice.currency': 'BRL',
      }
    };

    return ProductRecord.update(query, update, { multi: true }).then(() => {
      return app.destroy()
    });
  });
}

module.exports.undo = function (appOptions, migrationOptions) {
  // instantiate the app
  var app = createCebolaAPI(appOptions);

  return app.ready.then(() => {
    // TODO: implement undo
    return app.destroy();
  });
}
