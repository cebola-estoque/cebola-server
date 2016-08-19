const should = require('should');

const mongoose = require('mongoose');
const ValidationError = mongoose.Error.ValidationError;
const ValidatorError  = mongoose.Error.ValidatorError;

const Bluebird = require('bluebird');
const moment   = require('moment');

const aux = require('../../auxiliary');

const createInventoryAPI = require('../../../server');

describe('operationCtrl', function () {

  var ASSETS;
  var operationCtrl;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.inventoryAPI = createInventoryAPI(aux.genOptions({}));

        operationCtrl = ASSETS.inventoryAPI.controllers.operation;
      })
      .then(() => {
        // create a user, an organization and a product-model
        return ASSETS.inventoryAPI.controllers.user.create('john@example.com', 'john-password', {
          name: 'John Doe'
        });
      })
      .then((user) => {
        ASSETS.user = user

        // create a productModel
        
        return ASSETS.inventoryAPI.controllers.productModel.create(
          ASSETS.user, 
          {
            name: 'Test product',
            sku: '1823789127398',
          }
        );
      })
      .then((productModel) => {
        ASSETS.productModel = productModel;

        // create an entry shipment
        return ASSETS.inventoryAPI.controllers.shipment.create(
          ASSETS.user,
          {
            type: 'entry',
            source: {
              _id: '123456',
              name: 'Some other org',
            }
          }
        );
      })
      .then((shipment) => {
        ASSETS.shipment = shipment;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('scheduleEntry', function () {
    it('should create a new scheduled entry operation in the database', function () {

      return operationCtrl.scheduleEntry(
        ASSETS.user,
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          scheduledFor: moment().add(1, 'days'),
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((operation) => {
        mongoose.Types.ObjectId.isValid(operation._id).should.equal(true);

        operation.quantity.value.should.equal(30);
        operation.quantity.unit.should.equal('kg');

        operation.status.value.should.equal('scheduled');
        operation.type.should.equal('entry');

      })
      .catch(aux.logError);

    });

    it('should normalize the productExpiry to the end of the day', function () {

      var expiry = moment(Date.now()).add(10, 'days');

      return operationCtrl.scheduleEntry(
        ASSETS.user,
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          scheduledFor: moment().add(1, 'days'),
          productExpiry: expiry,

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((operation) => {
        expiry.endOf('day')
          .isSame(operation.productExpiry)
          .should.equal(true);
      })
      .catch(aux.logError);

    });

    it('should require the quantity to be positive for entries', function () {
      return operationCtrl.scheduleEntry(
        ASSETS.user,
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          scheduledFor: moment().add(1, 'days'),
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: -10,
            unit: 'kg'
          }
        }
      )
      .then(aux.errorExpected, function (err) {

        err.should.be.instanceof(ValidationError);
        err.errors['quantity.value'].kind.should.equal('QuantityAndOperationTypeMismatch');
      });
    });
  });

  describe('scheduleExit', function () {
    it('should create a new exit operation in the database', function () {

      var expiry = moment(Date.now()).add(10, 'days');

      return operationCtrl.scheduleEntry(
        ASSETS.user,
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          scheduledFor: moment().add(1, 'days'),
          productExpiry: expiry,

          quantity: {
            value: 40,
            unit: 'kg'
          }
        }
      )
      .then((scheduledEntry) => {
        return operationCtrl.effectivate(ASSETS.user, scheduledEntry);
      })
      .then(() => {
        return operationCtrl.scheduleExit(
          ASSETS.user,
          {
            shipment: ASSETS.shipment,
            productModel: ASSETS.productModel,
            scheduledFor: moment().add(1, 'days'),
            productExpiry: expiry,

            quantity: {
              value: -30,
              unit: 'kg',
            },
          }
        )
      })
      .then((operation) => {
        mongoose.Types.ObjectId.isValid(operation._id).should.equal(true);

        operation.quantity.value.should.equal(-30);
        operation.quantity.unit.should.equal('kg');

        operation.status.value.should.equal('scheduled');
        operation.type.should.equal('exit');

      })
      .catch(aux.logError);

    });

    it('should prevent scheduling of exits that exceed amount available', function () {
      return operationCtrl.scheduleExit(
        ASSETS.user,
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          scheduledFor: moment().add(1, 'days'),
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: -30,
            unit: 'kg',
          }
        }
      )
      .then(aux.errorExpected, (err) => {
        err.should.be.instanceof(ASSETS.inventoryAPI.errors.ProductNotAvailable);
      });
    });

    it('should require the quantity.value to be negative', function () {
      var expiry = moment(Date.now()).add(10, 'days');

      return operationCtrl.scheduleEntry(
        ASSETS.user,
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          scheduledFor: moment().add(1, 'days'),
          productExpiry: expiry,

          quantity: {
            value: 40,
            unit: 'kg'
          }
        }
      )
      .then((scheduledEntry) => {
        return operationCtrl.effectivate(ASSETS.user, scheduledEntry);
      })
      .then(() => {
        return operationCtrl.scheduleExit(
          ASSETS.user,
          {
            shipment: ASSETS.shipment,
            productModel: ASSETS.productModel,
            scheduledFor: moment().add(1, 'days'),
            productExpiry: expiry,

            quantity: {
              value: 30,
              unit: 'kg'
            }
          }
        );
      })
      .then(aux.errorExpected, (err) => {
        err.should.be.instanceof(ValidationError);
        err.errors['quantity.value'].kind.should.equal('QuantityAndOperationTypeMismatch');
      });
    })
  });

  describe('effectivate', function () {
    it('should modify the status of the scheduledRecord to `effective`', function () {
      return operationCtrl.scheduleEntry(
        ASSETS.user,
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          scheduledFor: moment().add(1, 'days'),
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((operation) => {
        
        return operationCtrl.effectivate(ASSETS.user, operation);

      })
      .then((operation) => {
        operation.status.value.should.equal('effective');
        operation.status.reason.should.equal('UserEffectivated');

        operation.history.length.should.equal(1);
        operation.history[0].status.value.should.equal('scheduled');
        operation.history[0].quantity.value.should.equal(30);
        operation.history[0].quantity.unit.should.equal('kg');
      })
      .catch(aux.logError);
    });
  });

  describe('cancel', function () {
    it('should modify the status of the scheduledRecord to `cancelled`', function () {
      return operationCtrl.scheduleEntry(
        ASSETS.user,
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          scheduledFor: moment().add(1, 'days'),
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((operation) => {
        
        return operationCtrl.cancel(ASSETS.user, operation);

      })
      .then((operation) => {
        operation.status.value.should.equal('cancelled');
        operation.status.reason.should.equal('UserCancelled');

        operation.history.length.should.equal(1);
        operation.history[0].status.value.should.equal('scheduled');
        operation.history[0].quantity.value.should.equal(30);
        operation.history[0].quantity.unit.should.equal('kg');
      })
      .catch(aux.logError);
    });
  });

  describe('registerLoss', function () {
    it('should create a operation of type `loss`', function () {
      return operationCtrl.scheduleEntry(
        ASSETS.user,
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          scheduledFor: moment().add(1, 'days'),
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((entryRecord) => {
        return operationCtrl.effectivate(ASSETS.user, entryRecord);
      })
      .then((entryRecord) => {
        return operationCtrl.registerLoss(
          ASSETS.user,
          {
            shipment: ASSETS.shipment,
            productModel: ASSETS.productModel,
            scheduledFor: moment().add(1, 'days'),
            productExpiry: moment(Date.now()).add(10, 'days'),

            quantity: {
              value: -10,
              unit: 'kg'
            }
          }
        )
      })
      .then((lossRecord) => {
        lossRecord.type.should.equal('loss');
        lossRecord.quantity.value.should.equal(-10);
        lossRecord.quantity.unit.should.equal('kg');
      })
      .catch(aux.logError);
    });

    it('should verify product availability prior to registering loss', function () {
      return operationCtrl.registerLoss(
        ASSETS.user, 
        {
          shipment: ASSETS.shipment,
          productModel: ASSETS.productModel,
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: -10,
            unit: 'kg'
          }
        }
      )
      .then(aux.errorExpected, (err) => {
        err.should.be.instanceof(ASSETS.inventoryAPI.errors.ProductNotAvailable);
      });
    });
  });
});
