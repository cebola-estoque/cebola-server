module.exports = function (app, options) {


  const STOCK_NOT_NULL = {
    inStock: {
      $ne: 0,
    }
  };

  const ALLOCATED_FOR_EXIT_NOT_NULL = {
    allocatedForExit: {
      $ne: 0,
    }
  };

  const ALLOCATED_FOR_ENTRY_NOT_NULL = {
    allocatedForEntry: {
      $ne: 0
    }
  };

  /**
   * Filters out irrelevant summaries
   * @type {Object}
   */
  const DEFAULT_SUMMARY_FILTER = {
    $or: [
      STOCK_NOT_NULL,
      ALLOCATED_FOR_EXIT_NOT_NULL,
      ALLOCATED_FOR_ENTRY_NOT_NULL
    ],
  };
  
  app.get('/inventory/summary',
    app.middleware.authorize(),
    function (req, res, next) {
      var query = req.query || {};

      app.controllers.inventory
        .summary(query, DEFAULT_SUMMARY_FILTER, null, {
          keepRecords: true,
          loadFullProductModel: true,
          loadFullProductSourceShipment: true,
        })
        .then((summary) => {
          console.log('summary', summary);
          res.json(summary);
        })
        .catch(next);
    }
  );
  
  app.get('/inventory/availability-summary',
    app.middleware.authorize(),
    function (req, res, next) {

      var date = req.query.date ? new Date(req.query.date) : new Date();

      app.controllers.inventory
        .availabilitySummary(date, null, DEFAULT_SUMMARY_FILTER, null, {
          keepRecords: false,
          loadFullProductModel: true,
          loadFullProductSourceShipment: true,
        })
        .then((summary) => {
          console.log('available-products', summary);
          res.json(summary);
        })
        .catch(next);

    }
  );
  
  app.get('/inventory/shipment/:shipmentId',
    app.middleware.authorize(),
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
