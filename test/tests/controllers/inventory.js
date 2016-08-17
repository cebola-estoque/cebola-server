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

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.inventoryAPI = createInventoryAPI(aux.genOptions({}));

        inventoryCtrl = ASSETS.inventoryAPI.controllers.inventory;
        recordCtrl    = ASSETS.inventoryAPI.controllers.record;
      })
      .then(() => {
        return ASSETS.inventoryAPI.controllers.user.create({
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
              fromOrg: ASSETS.orgs[1],
              toOrg: ASSETS.orgs[0]
            }
          ),
          ASSETS.inventoryAPI.controllers.invoice.create(
            ASSETS.user,
            {
              code: 'invoice-2',
              fromOrg: ASSETS.orgs[0],
              toOrg: ASSETS.orgs[1]
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

  describe('computeProductSummary', function () {

    it('should compute the quantity of the product at an organization', function () {

      // create and effectivate some records
      return Bluebird.all([
        /**
         * Entries for org-1 of product-1
         */
        recordCtrl.scheduleEntry(
          ASSETS.user, ASSETS.invoices[0],
          {
            productModel: ASSETS.productModels[0],
            productExpiry: moment(Date.now()).add(3, 'days'),

            quantity: {
              value: 30,
              unit: 'kg',
            },
          }
        ),
        recordCtrl.scheduleEntry(
          ASSETS.user, ASSETS.invoices[0],
          {
            productModel: ASSETS.productModels[0],
            productExpiry: moment(Date.now()).add(3, 'days'),

            quantity: {
              value: 30,
              unit: 'kg',
            },
          }
        ),
        recordCtrl.scheduleEntry(
          ASSETS.user, ASSETS.invoices[0],
          {
            productModel: ASSETS.productModels[0],
            productExpiry: moment(Date.now()).add(4, 'days'),

            quantity: {
              value: 30,
              unit: 'kg',
            },
          }
        ),
        /**
         * Entries for org-2 of product-1
         */
        recordCtrl.scheduleEntry(
          ASSETS.user, ASSETS.invoices[1],
          {
            productModel: ASSETS.productModels[0],
            productExpiry: moment(Date.now()).add(3, 'days'),

            quantity: {
              value: 30,
              unit: 'kg',
            },
          }
        )
      ])
      .then((scheduledRecords) => {
        return Bluebird.all(scheduledRecords.map((record) => {
          return recordCtrl.effectivate(ASSETS.user, record);
        }));
      })
      .then((effectivatedRecords) => {
        // count product-1 at org-1
        return inventoryCtrl.computeProductSummary(
          ASSETS.productModels[0],
          ASSETS.orgs[0]
        );
      })
      .then((org1Product1Summary) => {
        org1Product1Summary.length.should.equal(2);
        org1Product1Summary[0].quantityValue.should.equal(60);
        org1Product1Summary[1].quantityValue.should.equal(30);
      })

      // STUDIES:
      .then(() => {
        return inventoryCtrl.computeOrganizationSummary(ASSETS.orgs[0]);
      })
      .then((org1Summary) => {
        console.log(org1Summary);
      })

    });
  });

});
