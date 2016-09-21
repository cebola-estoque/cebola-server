// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  const cebola = app.services.cebola;

  const errors = app.errors;

  var ctrl = {};

  /**
   * Creates a new organization
   * @param  {Object} orgData
   * @return {Bluebird -> org}
   */
  ctrl.create = function (orgData) {
    return cebola.organization.create(orgData);
  };
  
  ctrl.search = function (searchQuery) {
    return cebola.models.Organization.find({
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
