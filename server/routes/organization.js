// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/organizations',
    app.middleware.authenticate(),
    bodyParser.json(),
    function (req, res, next) {

      var authorData = {
        _id: req.tokenData.sub,
        name: req.tokenData.name,
      };

      app.controllers.organization.create(req.body)
        .then((organization) => {
          res.json({
            _id: organization._id,
            name: organization.name,
          });
        })
        .catch(next);
    }
  );

  app.get('/organizations',
    app.middleware.authenticate(),
    function (req, res, next) {

      var searchQuery = req.query.q;

      var filterQuery = {};
      if (req.query.roles) {
        filterQuery.roles = req.query.roles.split(',')
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

};
