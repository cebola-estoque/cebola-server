// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const OrganizationContact = app.services.mongoose.models.OrganizationContact;

  const errors = app.errors;

  var ctrl = {};

  /**
   * Creates a new organization
   * @param  {Object} orgData
   * @return {Bluebird -> org}
   */
  ctrl.create = function (orgData) {
    var org = new OrganizationContact(orgData);

    return org.save();
  };

  ctrl.getById = function (id) {
    return OrganizationContact.findOne({
      _id: id,
    })
    .then((organization) => {
      if (!organization) {
        return Bluebird.reject(new errors.NotFound('organization', id));
      } else {
        return organization;
      }
    });
  };

  return ctrl;
};
