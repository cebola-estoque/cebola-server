const should = require('should');

const mongoose = require('mongoose');
const Bluebird = require('bluebird');
const jwt      = require('jsonwebtoken');

const aux = require('../../auxiliary');

const createInventoryAPI = require('../../../server');

describe('authCtrl', function () {

  var ASSETS;
  var authCtrl;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.inventoryAPI = createInventoryAPI(aux.genOptions({}));

        authCtrl = ASSETS.inventoryAPI.controllers.auth;

        // create 2 users
        return Bluebird.all([
          ASSETS.inventoryAPI.controllers.user.create(
            'john@example.com',
            'test-password',
            {
              name: 'John Doe',
            }
          ),
          ASSETS.inventoryAPI.controllers.user.create(
            'alice@example.com',
            'test-password-2',
            {
              name: 'Alice',
            }
          ),
        ]);
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('issueToken', function () {

    it('should generate a token given valid credentials', function () {

      return authCtrl.generateToken('john@example.com', 'test-password')
        .then((token) => {
          token.should.be.instanceof(String);

          var decoded = jwt.decode(token);

          decoded.sub.should.be.instanceof(String);
        });
    });

    it('should refuse to generate token if credentials are invalid', function () {
      return authCtrl.generateToken('john@example.com', 'wrong-password')
        .then(aux.errorExpected, (err) => {
          err.should.be.instanceof(ASSETS.inventoryAPI.errors.Unauthorized);
        });
    });

    it('should require email', function () {
      return authCtrl.generateToken(undefined, 'test-password')
        .then(aux.errorExpected, (err) => {
          err.should.be.instanceof(ASSETS.inventoryAPI.errors.InvalidOption);
          err.option.should.equal('email');
        });
    });

    it('should require plainTextPassword', function () {
      return authCtrl.generateToken('john@example.com', undefined)
        .then(aux.errorExpected, (err) => {
          err.should.be.instanceof(ASSETS.inventoryAPI.errors.InvalidOption);
          err.option.should.equal('plainTextPassword');
        });
    });

  });

  describe('verifyToken', function () {
    it('should decode the token', function () {
      return authCtrl.generateToken('alice@example.com', 'test-password-2')
        .then((token) => {
          return authCtrl.verifyToken(token);
        })
        .then((decoded) => {
          decoded.sub.should.be.instanceof(String);
        })
        .catch(aux.logError);
    });
    it('should refuse to decode a forged token', function () {

      var forgedToken = jwt.sign({
        sub: 'alice@example.com',
      }, 'FORGED-SECRET');

      return authCtrl.verifyToken(forgedToken)
        .then(aux.errorExpected, (err) => {
          err.should.be.instanceof(ASSETS.inventoryAPI.errors.Unauthorized);
        });
    });
  })
});
