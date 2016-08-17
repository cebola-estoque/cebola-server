const should = require('should');

const mongoose = require('mongoose');
const Bluebird = require('bluebird');
const moment   = require('moment');

const aux = require('../../auxiliary');

const createInventoryAPI = require('../../../server');

describe('recordCtrl', function () {

  var ASSETS;
  var recordCtrl;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.inventoryAPI = createInventoryAPI(aux.genOptions({}));

        recordCtrl = ASSETS.inventoryAPI.controllers.record;
      })
      .then(() => {
        // create a user, an organization and a product-model
        return Bluebird.all([
          ASSETS.inventoryAPI.controllers.user.create({
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

        // create an invoice from org 1 to org 2
        return ASSETS.inventoryAPI.controllers.invoice.create(
          ASSETS.user,
          {
            code: '123456',
            fromOrg: ASSETS.orgs[0],
            toOrg: ASSETS.orgs[1]
          }
        );
      })
      .then((invoice) => {
        ASSETS.invoice = invoice;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('scheduleEntry', function () {
    it('should create a new scheduled entry record in the database', function () {

      return recordCtrl.scheduleEntry(
        ASSETS.user, ASSETS.invoice,
        {
          productModel: ASSETS.productModel,
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((record) => {
        mongoose.Types.ObjectId.isValid(record._id).should.equal(true);

        record.quantity.value.should.equal(30);
        record.quantity.unit.should.equal('kg');

        record.status.value.should.equal('scheduled');
        record.type.should.equal('entry');

      })
      .catch(aux.logError);

    });

    it('should normalize the productExpiry to the end of the day', function () {

      var expiry = moment(Date.now()).add(10, 'days');

      return recordCtrl.scheduleEntry(
        ASSETS.user, ASSETS.invoice,
        {
          productModel: ASSETS.productModel,
          productExpiry: expiry,

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((record) => {
        expiry.endOf('day')
          .isSame(record.productExpiry)
          .should.equal(true);
      })
      .catch(aux.logError);

    });
  });

  describe('scheduleExit', function () {
    it('should create a new exit record in the database', function () {

      return recordCtrl.scheduleExit(
        ASSETS.user, ASSETS.invoice,
        {
          productModel: ASSETS.productModel,
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: -30,
            unit: 'kg',
          },
        }
      )
      .then((record) => {
        mongoose.Types.ObjectId.isValid(record._id).should.equal(true);

        record.quantity.value.should.equal(-30);
        record.quantity.unit.should.equal('kg');

        record.status.value.should.equal('scheduled');
        record.type.should.equal('exit');

      })
      .catch(aux.logError);

    });
  });

  describe('effectivate', function () {
    it('should modify the status of the scheduledRecord to `effective`', function () {
      return recordCtrl.scheduleEntry(
        ASSETS.user, ASSETS.invoice,
        {
          productModel: ASSETS.productModel,
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((record) => {
        
        return recordCtrl.effectivate(ASSETS.user, record);

      })
      .then((record) => {
        record.status.value.should.equal('effective');
        record.status.reason.should.equal('UserEffectivated');

        record.history.length.should.equal(1);
        record.history[0].status.value.should.equal('scheduled');
        record.history[0].quantity.value.should.equal(30);
        record.history[0].quantity.unit.should.equal('kg');
      })
      .catch(aux.logError);
    });
  });

  describe('cancel', function () {
    it('should modify the status of the scheduledRecord to `cancelled`', function () {
      return recordCtrl.scheduleEntry(
        ASSETS.user, ASSETS.invoice,
        {
          productModel: ASSETS.productModel,
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((record) => {
        
        return recordCtrl.cancel(ASSETS.user, record);

      })
      .then((record) => {
        record.status.value.should.equal('cancelled');
        record.status.reason.should.equal('UserCancelled');

        record.history.length.should.equal(1);
        record.history[0].status.value.should.equal('scheduled');
        record.history[0].quantity.value.should.equal(30);
        record.history[0].quantity.unit.should.equal('kg');
      })
      .catch(aux.logError);
    });
  });

  describe('registerLoss', function () {
    it('should create a record of type `loss`', function () {
      return recordCtrl.scheduleEntry(
        ASSETS.user, ASSETS.invoice,
        {
          productModel: ASSETS.productModel,
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      )
      .then((entryRecord) => {
        return recordCtrl.effectivate(ASSETS.user, entryRecord);
      })
      .then((entryRecord) => {
        return recordCtrl.registerLoss(ASSETS.user, ASSETS.invoice, {
          productModel: ASSETS.productModel,
          productExpiry: moment(Date.now()).add(10, 'days'),

          quantity: {
            value: 10,
            unit: 'kg'
          }
        })
      })
      .then((lossRecord) => {
        lossRecord.type.should.equal('loss');
        lossRecord.quantity.value.should.equal(10);
        lossRecord.quantity.unit.should.equal('kg');
      })
      .catch(aux.logError);
    });
  });
});
