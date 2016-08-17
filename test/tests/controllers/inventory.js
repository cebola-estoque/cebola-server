const should = require('should');

const mongoose = require('mongoose');
const Bluebird = require('bluebird');
const moment   = require('moment');

const aux = require('../../auxiliary');

const createInventoryAPI = require('../../../server');

describe('inventoryCtrl', function () {

  var ASSETS;
  var inventoryCtrl;
  var recordCtrl;

  function _scheduleEntries(user, invoice, entriesData) {
    return Bluebird.all(entriesData.map((entryData) => {
      return recordCtrl.scheduleEntry(
        user,
        invoice,
        entryData
      );
    }));
  }

  function _scheduleExits(user, invoice, exitsData) {
    return Bluebird.all(exitsData.map((exitData) => {
      return recordCtrl.scheduleExit(
        user,
        invoice,
        exitData
      );
    }));
  }

  function _effectivateRecords(user, records) {
    return Bluebird.all(records.map((record) => {
      return recordCtrl.effectivate(user, record);
    }));
  }

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.inventoryAPI = createInventoryAPI(aux.genOptions({}));

        inventoryCtrl = ASSETS.inventoryAPI.controllers.inventory;
        recordCtrl    = ASSETS.inventoryAPI.controllers.record;
      })
      .then(() => {
        return ASSETS.inventoryAPI.controllers.user.create('john@example.com', 'john-password', {
          name: 'John Doe'
        });
      })
      .then((user) => {

        ASSETS.user = user;

        // create a user, an organization and a product-model
        return Bluebird.all([
          ASSETS.inventoryAPI.controllers.productModel.create({
            name: 'Test product 1',
            sku: '1823789127398',
          }),
          ASSETS.inventoryAPI.controllers.productModel.create({
            name: 'Test product 2',
            sku: '893u4189u12',
          }),
        ]);
      })
      .then((productModels) => {
        ASSETS.productModels = productModels;

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
      .then((orgs) => {
        ASSETS.orgs = orgs;

        return Bluebird.all([
          ASSETS.inventoryAPI.controllers.invoice.create(
            ASSETS.user,
            {
              code: 'invoice-1',
              source: ASSETS.orgs[1],
              destination: ASSETS.orgs[0]
            }
          ),
          ASSETS.inventoryAPI.controllers.invoice.create(
            ASSETS.user,
            {
              code: 'invoice-2',
              source: ASSETS.orgs[0],
              destination: ASSETS.orgs[1]
            }
          ),
        ]);
      })
      .then((invoices) => {
        ASSETS.invoices = invoices;
      })
      .catch(aux.logError);
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('computeOrgProductSummary', function () {

    it('should compute the quantity of the product at an organization', function () {

      var expiresIn3 = moment(Date.now()).add(3, 'days');
      var expiresIn4 = moment(Date.now()).add(4, 'days')

      // schedule and effectivate entries
      return _scheduleEntries(ASSETS.user, ASSETS.invoices[0], [
        {
          productModel: ASSETS.productModels[0],
          scheduledFor: moment().add(1, 'day'),
          productExpiry: expiresIn3,
          quantity: {
            value: 30,
            unit: 'kg'
          }
        },
        {
          productModel: ASSETS.productModels[0],
          scheduledFor: moment().add(1, 'day'),
          productExpiry: expiresIn3,

          quantity: {
            value: 30,
            unit: 'kg',
          },
        },
        {
          productModel: ASSETS.productModels[0],
          scheduledFor: moment().add(1, 'day'),
          productExpiry: expiresIn4,

          quantity: {
            value: 30,
            unit: 'kg',
          },
        }
      ])
      .then((scheduledRecords) => {
        return _effectivateRecords(ASSETS.user, scheduledRecords);
      })
      .then(() => {
        // schedule and effectivate some exits
        return _scheduleExits(ASSETS.user, ASSETS.invoices[1], [
          {
            productModel: ASSETS.productModels[0],
            scheduledFor: moment().add(1, 'day'),
            productExpiry: expiresIn3,

            quantity: {
              value: -20,
              unit: 'kg'
            }
          }
        ]);
      })
      .then((scheduledExits) => {
        return _effectivateRecords(ASSETS.user, scheduledExits);
      })
      .then(() => {
        // count product-1 at org-1
        return inventoryCtrl.computeOrgProductSummary(
          ASSETS.orgs[0],
          ASSETS.productModels[0]
        );
      })
      .then((org1Product1Summary) => {

        org1Product1Summary.length.should.equal(2);
        org1Product1Summary[0].quantity.value.should.equal(40);
        org1Product1Summary[1].quantity.value.should.equal(30);
      });
    });

    it('should only count records with status at `effective`', function () {
      // schedule and effectivate entries
      return _scheduleEntries(ASSETS.user, ASSETS.invoices[0], [
        {
          productModel: ASSETS.productModels[0],
          scheduledFor: moment().add(1, 'day'),
          productExpiry: moment(Date.now()).add(3, 'days'),
          quantity: {
            value: 30,
            unit: 'kg'
          }
        },
        {
          productModel: ASSETS.productModels[0],
          scheduledFor: moment().add(1, 'day'),
          productExpiry: moment(Date.now()).add(3, 'days'),

          quantity: {
            value: 30,
            unit: 'kg',
          },
        },
      ])
      .then((scheduledRecords) => {
        return _effectivateRecords(ASSETS.user, scheduledRecords);
      })
      .then(() => {
        // schedule and DO NOT effectivate
        return _scheduleEntries(ASSETS.user, ASSETS.invoices[0], [
          {
            productModel: ASSETS.productModels[0],
            scheduledFor: moment().add(1, 'day'),
            productExpiry: moment(Date.now()).add(3, 'days'),
            quantity: {
              value: 11,
              unit: 'kg'
            }
          },
        ]);
      })
      .then(() => {
        // count product-1 at org-1
        return inventoryCtrl.computeOrgProductSummary(
          ASSETS.orgs[0],
          ASSETS.productModels[0]
        );
      })
      .then((org1Product1Summary) => {
        org1Product1Summary.length.should.equal(1);
        org1Product1Summary[0].quantity.value.should.equal(60);
        org1Product1Summary[0].quantity.unit.should.equal('kg');
      })
    })
  });

});
