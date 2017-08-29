module.exports = function (app, options) {

  // TODO: auth
  app.get('/inventory/summary',
    function (req, res, next) {
      var query = req.query || {};

      app.controllers.inventory
        .summary(query, null, null, { keepRecords: true })
        .then((summary) => {
          console.log('summary', summary);
          res.json(summary);
        })
        .catch(next);
    }
  );

  // TODO: auth
  app.get('/inventory/availability-summary',
    function (req, res, next) {

      var date = req.query.date ? new Date(req.query.date) : new Date();

      app.controllers.inventory
        .availabilitySummary(date, null, null, null, { keepRecords: false })
        .then((summary) => {
          console.log('available-products', summary);
          res.json(summary);
        })
        .catch(next);

    }
  );
  
  // TODO: auth
  app.get('/inventory/shipment/:shipmentId',
    function (req, res, next) {
      
      app.controllers.inventory.shipmentSummary(
        req.params.shipmentId,
        false,
        false,
        false,
        {
          keepRecords: true
        }
      )
      .then((summary) => {
        res.json(summary);
      })
      .catch(next);
      
    }
  );

};
