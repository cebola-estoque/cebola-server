module.exports = function (app, options) {

  // TODO: auth
  app.get('/inventory/available-products',
    // app.middleware.authenticate(),
    function (req, res, next) {
      app.controllers.inventory
        .summary(null, null, null, { keepRecords: true })
        .then((summary) => {
          console.log('summary', summary);
          res.json(summary);
        })
        .catch(next);
    }
  );

  // app.get('/inventory/search',
  //   app.middleware.authenticate(),
  //   function (req, res, next) {

  //     var query = req.query.q;

  //     app.controllers.inventory
  //       .search(query)
  //       .then((summary) => {
  //         res.json(summary);
  //       })
  //       .catch(next);
  //   }
  // );
  
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
