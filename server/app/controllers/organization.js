// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const Organization = app.services.mongoose.models.Organization;

  const errors = app.errors;

  var organizationCtrl = {};

  /**
   * Creates a new organization
   * @param  {Object} orgData
   * @return {Bluebird -> org}
   */
  organizationCtrl.create = function (orgData) {
    var org = new Organization(orgData);

    return org.save();
  };

  return organizationCtrl;
};
