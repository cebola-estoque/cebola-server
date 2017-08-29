// native
const path = require('path');

// third-party
const multer = require('multer');
const mime   = require('mime');
const uuid   = require('uuid');

module.exports = function (app, options) {

  var storage = multer.diskStorage({
    destination: path.join(__dirname, '../../tmp-uploads'),
    filename: function (req, file, cb) {

      var filename = uuid.v4() + '.' + mime.extension(file.mimetype);

      cb(null, filename);
    }
  });

  var uploadSvc = multer({
    storage: storage,
  });

  app.services.upload = uploadSvc;
};
