const should = require('should');

const Bluebird = require('bluebird');
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

        ASSETS.cebolaServer = createInventoryAPI(aux.genOptions({}));

        organizationCtrl = ASSETS.cebolaServer.controllers.organization;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('#create(orgData)', function () {

    it('should create a new organization', function () {

      return organizationCtrl.create({
        name: 'Test Organization',
        roles: ['supplier'],
        document: {
          type: 'CNPJ',
          value: '87.023.556/0001-81',
        },

        // mixed in
        CDE: '9012997763-1',
      })
      .then((organization) => {
        organization.name.should.eql('Test Organization');
        organization.roles[0].should.eql('supplier');
        organization.document.type.should.eql('CNPJ');
        organization.document.value.should.eql('87.023.556/0001-81');
        organization.CDE.should.eql('9012997763-1');
      });
    })
  });

  describe('#search(searchQuery)', function () {

    beforeEach(function () {
      return Bluebird.all([
        organizationCtrl.create({
          name: 'Test Organization',
          roles: ['supplier'],
          document: {
            type: 'CNPJ',
            value: '87.023.556/0001-81',
          },

          // mixed in
          CDE: '9012997763-1',
        }),
        organizationCtrl.create({
          name: 'Test Another Organization',
          roles: ['supplier'],
          document: {
            type: 'CNPJ',
            value: '87.023.556/0001-81',
          },

          // mixed in
          CDE: '9012997763-1',
        }),
      ]);
    });

    it('should search organizations by name', function () {

      this.timeout(5000);

      return new Bluebird((resolve, reject) => {
        setTimeout(resolve, 2000);
      })
      .then(() => {
        return organizationCtrl.search('Another');
      })
      .then((results) => {
        results.length.should.eql(1);
      });
    });
  });
});
