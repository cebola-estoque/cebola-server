// third-party
const mongoose = require('mongoose');
const Bluebird = require('bluebird');

// Use bluebird as mongoose promise implementation
mongoose.Promise = Bluebird;

module.exports = function (app, options) {
  
  var mongooseService = {};

  return new Bluebird((resolve, reject) => {
    // create a connection to the database
    var conn = mongoose.createConnection(options.mongodbURI);
    
    mongooseService.connection = conn;
    
    conn.once('connected', _resolve);
    conn.once('error', _reject);
    conn.once('disconnected', _reject);

    function off () {
      conn.removeListener('connected', _resolve);
      conn.removeListener('error', _reject);
      conn.removeListener('disconnected', _reject);
    }

    function _resolve () {
      off();
      resolve();
    }

    function _reject () {
      off();
      reject();
    }
  })
  .then(() => {
    // load models
    mongooseService.models = {};
    mongooseService.models.User =
      require('../models/user')(mongooseService.connection, app, options);

    return mongooseService;
  });
};
