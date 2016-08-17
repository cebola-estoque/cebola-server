// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const Invoice = app.services.mongoose.models.Invoice;

  const errors = app.errors;

  var invoiceCtrl = {};

  invoiceCtrl.create = function (author, data) {
    var invoice = new Invoice(data);

    invoice.set('author._id', author._id);
    invoice.set('author.name', author.name);

    return invoice.save();
  };
  
  return invoiceCtrl;

};
