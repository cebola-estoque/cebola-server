module.exports = function (app, options) {

  app.get('/inventory/summary',
    app.middleware.authenticate(),
    function (req, res, next) {
      app.controllers.inventory
        .computeSummary()
        .then((summary) => {
          res.json(summary);
        })
        .catch(next);
    }
  );

  app.get('/inventory/search',
    app.middleware.authenticate(),
    function (req, res, next) {

      var query = req.query.q;

      app.controllers.inventory
        .search(query)
        .then((summary) => {
          res.json(summary);
        })
        .catch(next);
    }
  );

};
