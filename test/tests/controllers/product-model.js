const should = require('should');

const mongoose = require('mongoose');
const Bluebird = require('bluebird');

const aux = require('../../auxiliary');

const createInventoryAPI = require('../../../server');

describe('productModelCtrl', function () {

  var ASSETS;
  var productModelCtrl;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.inventoryAPI = createInventoryAPI(aux.genOptions({}));

        productModelCtrl = ASSETS.inventoryAPI.controllers.productModel;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('create', function () {
    it('should create a new productModel entry in the database', function () {

      var userData = {
        _id: '1234',
        name: 'Some user name',
      };

      return productModelCtrl.create(userData, {
        name: 'Test Product',
        sku: '12345678',
      })
      .then((productModel) => {
        mongoose.Types.ObjectId.isValid(productModel._id).should.equal(true);
      });

    });
  });

  describe('search', function () {
    it('should search for productModels by their names in the database', function () {

      this.timeout(5000);

      var userData = {
        _id: '1234',
        name: 'Some user name',
      };

      // create some products

      return Bluebird.all([
        {
          name: 'The first product',
          sku: '12345',
        },
        {
          name: 'Another weird product',
          sku: '123456',
        },
        {
          name: 'Some green thing',
          sku: '123456',
        },
        {
          name: 'Laranja lima 10unid/cx',
          sku: '12345',
        },
        {
          name: 'Laranja pêra 50unid/cx',
          sku: '12345',
        },
        {
          name: 'Laranja lima 20unid/cx',
          sku: '12345',
        }

      ].map((data) => {
        return productModelCtrl.create(userData, data);
      }))
      .then((productModels) => {

        return new Bluebird((resolve) => {
          // wait some time for the products to be indexed by mongodb
          // TODO: study best way of ensuring the index was created
          // for test databases
          setTimeout(resolve, 2000);
        });

      })
      .then(() => {

        return productModelCtrl.search('laranja');
      })
      .then((searchResults) => {
        searchResults.length.should.equal(3);

        return productModelCtrl.search('pera');
      })
      .then((searchResults) => {
        searchResults.length.should.equal(1);

        return productModelCtrl.search('laranja pe');
      })
      .then((searchResults) => {
        console.log(searchResults);

        searchResults.length.should.equal(3);
        searchResults[0].name.should.equal('Laranja pêra 50unid/cx');
      });

    });
  });
});
