const should = require('should');

const mongoose = require('mongoose');

const aux = require('../../auxiliary');

const createInventoryAPI = require('../../../server');

describe('organizationCtrl', function () {

  var ASSETS;
  var organizationCtrl;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.inventoryAPI = createInventoryAPI(aux.genOptions({}));

        organizationCtrl = ASSETS.inventoryAPI.controllers.organization;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('create', function () {
    it('should create a new organization entry in the database', function () {

      return organizationCtrl.create({
        name: 'Test org',
        document: {
          value: '1234567',
          type: 'CPF',
        }
      })
      .then((org) => {
        mongoose.Types.ObjectId.isValid(org._id).should.equal(true);
      });

    });
  });
});
