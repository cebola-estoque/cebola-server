const should = require('should');

const mongoose = require('mongoose');

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

      var orgData = {
        _id: '1234',
        name: 'Org 1'
      };

      return productModelCtrl.create(userData, orgData, {
        name: 'Test Product',
        sku: '12345678',
      })
      .then((org) => {
        mongoose.Types.ObjectId.isValid(org._id).should.equal(true);
      });

    });
  });
});
