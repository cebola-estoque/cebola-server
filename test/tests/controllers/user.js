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

      return userCtrl.create('john@example.com', 'test-password', {
        name: 'John Doe',
      })
      .then((user) => {
        mongoose.Types.ObjectId.isValid(user._id).should.equal(true);

        // refetch the user from the database and check its properties
        return ASSETS.inventoryAPI.services.mongoose.models.User.find({
          email: 'john@example.com'
        })
      })
      .then((users) => {
        users.length.should.equal(1);

        users[0].email.should.equal('john@example.com');
        users[0].name.should.equal('John Doe');
        users[0]._pwdHash.should.be.instanceof(String);
        users[0]._id.should.be.instanceof(mongoose.Types.ObjectId);
        users[0].roles.should.be.instanceof(Array);
        users[0].status.value.should.equal('active');

        Object.keys(users[0].toJSON()).length.should.equal(7);
      });

    });

    it('should require email', function () {
      return userCtrl.create(undefined, 'test-password', {
        name: 'John Doe',
      })
      .then(aux.errorExpected, (err) => {
        err.should.be.instanceof(ASSETS.inventoryAPI.errors.InvalidOption);
        err.option.should.equal('email');
      })
    });

    it('should require password', function () {
      return userCtrl.create('john@example.com', undefined, {
        name: 'John Doe',
      })
      .then(aux.errorExpected, (err) => {
        err.should.be.instanceof(ASSETS.inventoryAPI.errors.InvalidOption);
        err.option.should.equal('plainTextPassword');
      })
    });

    it('should require name', function () {
      return userCtrl.create('john@example.com', 'test-password', {
        // name: 'John Doe',
      })
      .then(aux.errorExpected, (err) => {
        err.should.be.instanceof(mongoose.Error.ValidationError);
      });
    });


    it('should enforce email uniqueness', function () {
      return userCtrl.create('john@example.com', 'test-password', {
        name: 'John Doe',
      })
      .then(() => {
        return userCtrl.create('john@example.com', 'test-password', {
          name: 'John Doe',
        })
      })
      .then(aux.errorExpected, (err) => {
        err.should.be.instanceof(ASSETS.inventoryAPI.errors.EmailTaken);
      });
    })
  });
});
