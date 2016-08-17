const should = require('should');

const mongoose = require('mongoose');

const aux = require('../../auxiliary');

const createInventoryAPI = require('../../../server');

describe('userCtrl', function () {

  var ASSETS;
  var userCtrl;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.inventoryAPI = createInventoryAPI(aux.genOptions({}));

        userCtrl = ASSETS.inventoryAPI.controllers.user;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('create', function () {
    it('should create a new user entry in the database', function () {

      return userCtrl.create({
        name: 'John Doe',
      })
      .then((org) => {
        mongoose.Types.ObjectId.isValid(org._id).should.equal(true);
      });

    });
  });
});
