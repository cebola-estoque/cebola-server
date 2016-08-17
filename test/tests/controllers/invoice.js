const should = require('should');

const mongoose = require('mongoose');
const Bluebird = require('bluebird');

const aux = require('../../auxiliary');

const createInventoryAPI = require('../../../server');

describe('invoiceCtrl', function () {

  var ASSETS;
  var invoiceCtrl;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.inventoryAPI = createInventoryAPI(aux.genOptions({}));

        invoiceCtrl = ASSETS.inventoryAPI.controllers.invoice;
      })
      .then(() => {
        // create a user, an organization and a product-model
        return Bluebird.all([
          ASSETS.inventoryAPI.controllers.user.create('john@example.com', 'john-password', {
            name: 'John Doe'
          }),
          ASSETS.inventoryAPI.controllers.productModel.create({
            name: 'Test product',
            sku: '1823789127398',
          })
        ]);
      })
      .then((results) => {
        ASSETS.user         = results[0];
        ASSETS.productModel = results[1];

        // register 2 organizations
        return Bluebird.all([
          ASSETS.inventoryAPI.controllers.organization.create({
            name: 'Org 1',
            document: {
              type: 'CNPJ',
              value: '12345678',
            }
          }),
          ASSETS.inventoryAPI.controllers.organization.create({
            name: 'Org 2',
            document: {
              type: 'CNPJ',
              value: '12345678',
            }
          }),
        ]);
      })
      .then((results) => {
        ASSETS.orgs = results;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('create', function () {
    it('should create a new invoice entry in the database', function () {

      return invoiceCtrl.create(ASSETS.user, {
        code: '123456/12312',
        source: ASSETS.orgs[0],
        destination: ASSETS.orgs[1],
      })
      .then((invoice) => {
        mongoose.Types.ObjectId.isValid(invoice._id).should.equal(true);
      })
      .catch((err) => {
        console.log(err);

        throw err;
      });

    });
  });
});
