// third-party
const Bluebird = require('bluebird');

const aux = require('../auxiliary');

module.exports = function (app, options) {

  const cebola = app.services.cebola;

  const errors = app.errors;

  var ctrl = {};

  aux.proxyMethods(ctrl, cebola.organization, [
    'create',
    'list',
    'delete',
  ]);
  
  ctrl.search = function (searchQuery, filterQuery) {

    filterQuery = filterQuery || {};

    filterQuery.$text = {
      $search: searchQuery,
    };

    return cebola.models.Organization.find(filterQuery, {
      score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta : 'textScore' } })
    .exec();
  };

  return ctrl;
};
