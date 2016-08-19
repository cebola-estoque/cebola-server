// third-party
const bodyParser = require('body-parser');

module.exports = function (app, options) {

  app.post('/organization-contacts',
    app.middleware.authenticate(),
    bodyParser.json(),
    function (req, res, next) {

      var authorData = {
        _id: req.tokenData.sub,
        name: req.tokenData.name,
      };

      app.controllers.organizationContact.create(authorData, req.body)
        .then((organizationContact) => {
          res.json({
            _id: organizationContact._id,
            name: organizationContact.name,
          });
        })
        .catch(next);
    }
  );

  app.get('/organization-contacts',
    app.middleware.authenticate(),
    function (req, res, next) {

      var searchQuery = req.query.q;

      var promise;

      if (searchQuery) {
        promise = app.controllers.organizationContact.search(searchQuery);
      } else {
        promise = app.controllers.organizationContact.list()
      }
      
      promise.then((organizationContacts) => {
        res.json(organizationContacts);
      })
      .catch(next);
    }
  );

};
