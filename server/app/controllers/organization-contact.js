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
  ctrl.create = function (authorData, orgData) {
    var org = new OrganizationContact(orgData);

    org.set('author', authorData);

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

  ctrl.list = function () {
    return OrganizationContact.find();
  };

  ctrl.search = function (searchQuery) {
    return OrganizationContact.find({
      $text: {
        $search: searchQuery,
      }
    }, {
      score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta : 'textScore' } })
    .exec();
  };

  return ctrl;
};
