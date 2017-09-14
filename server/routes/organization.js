// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  /**
   * Creates an organization
   */
  app.post('/organizations',
    app.middleware.authorize(),
    bodyParser.json(),
    function (req, res, next) {

      app.controllers.organization.create(req.body)
        .then((organization) => {
          res.json(organization);
        })
        .catch(next);
    }
  );

  /**
   * Retrieves a list of organizations
   */
  app.get('/organizations',
    app.middleware.authorize(),
    function (req, res, next) {

      var searchQuery = req.query.q;

      var filterQuery = {};
      if (req.query.roles) {
        filterQuery.roles = {
          $in: req.query.roles.split(',')
        };
      }

      var promise;

      if (searchQuery) {
        promise = app.controllers.organization.search(searchQuery, filterQuery);
      } else {
        promise = app.controllers.organization.list(filterQuery)
      }
      
      promise.then((organizations) => {
        res.json(organizations);
      })
      .catch(next);
    }
  );
  
  /**
   * Updates an organization
   */
  app.put('/organization/:organizationId',
    app.middleware.authorize(),
    app.middleware.loadOrganization({}),
    bodyParser.json(),
    function (req, res, next) {
      
      var organizationData = req.body;
      var organization = req.organization;
      
      organization.set(organizationData).save().then((organization) => {
        res.json(organization);
      })
      .catch(next);
    }
  );
  
  app.delete('/organization/:organizationId',
    app.middleware.authorize(),
    app.middleware.loadOrganization({}),
    function (req, res, next) {
      var organization = req.organization;
      
      return organization.remove().then(() => {
        // TODO: check correct status code
        res.status(204).end();
      })
      .catch(next);
    }
  );

};
