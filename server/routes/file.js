// native
const path = require('path');

// third-party
const bodyParser = require('body-parser');
const express    = require('express');

module.exports = function (app, options) {

  app.post('/files',
    app.middleware.authorize(),
    app.services.upload.single('file'),
    function (req, res, next) {

      // res.json({
      //   filename: req.file.filename,
      //   mimetype: req.file.mimetype,
      //   size: req.file.size,
      //   url: options.host + '/files/' + req.file.filename,
      // });

      res.json({
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: req.file.location,
      });
    }
  );

  /**
   * Serve uploaded files
   */
  // app.use('/files', express.static(path.join(__dirname, '../../tmp-uploads')));
};
