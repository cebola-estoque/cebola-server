// native dependencies
const path = require('path');
const http = require('http');

// third-party dependencies
const MongoClient = require('mongodb').MongoClient;
const enableDestroy = require('server-destroy');

const Bluebird = require('bluebird');

if (process.env.DEBUG === 'TRUE') {
  // set mongoose to debug mode
  require('mongoose').set('debug', true);
}

const TEST_DB_URI = 'mongodb://localhost:27017/inventory-api';

exports.logError = function (err) {
  console.warn(err);

  throw err;
};

exports.defaultOptions = {
  mongodbURI: TEST_DB_URI,
  secret: 'secret',
};

exports.genOptions = function (opts) {
  return Object.assign({}, exports.defaultOptions, opts);
};

exports.dbURI = TEST_DB_URI;

/**
 * Used to reject successful promises that should have not been fulfilled
 * @return {Bluebird Rejection}
 */
exports.errorExpected = function () {
  return Bluebird.reject(new Error('error expected'));
};

/**
 * Starts a server and keeps reference to it.
 * This reference will be used for teardown.
 */
exports.startServer = function (port, app) {

  if (!port) { throw new Error('port is required'); }
  if (!app) { throw new Error('app is required'); }

  // create http server and pass express app as callback
  var server = http.createServer();

  // make the server destroyable
  enableDestroy(server);

  server.on('request', app);

  return new Promise((resolve, reject) => {
    server.listen(port, () => {

      // register the server to be tore down
      exports.registerTeardown(function () {
        return new Promise(function (resolve, reject) {
          server.destroy((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        })
      });

      // resolve with the server
      resolve(server);
    });
  });
};

/**
 * Sets up an assets object that is ready for the tests
 * @return {[type]} [description]
 */
exports.setup = function () {

  var _assets = {
    dbURI: TEST_DB_URI,
  };
  
  return MongoClient.connect(TEST_DB_URI)
    .then((db) => {

      _assets.db = db;

      // register teardown
      exports.registerTeardown(function () {

        // drop database
        return _assets.db.dropDatabase().then(() => {
          return _assets.db.close();
        });
      });

      return _assets.db.dropDatabase();
    })
    .then(() => {

      // always return the assets object
      return _assets;
    });
};

var TEARDOWN_CALLBACKS = [];

/**
 * Register a teardown function to be executed by the teardown
 * The function should return a promise
 */
exports.registerTeardown = function (teardown) {
  TEARDOWN_CALLBACKS.push(teardown);
};

/**
 * Executes all functions listed at TEARDOWN_CALLBACKS
 */
exports.teardown = function () {
  return Promise.all(TEARDOWN_CALLBACKS.map((fn) => {
    return fn();
  }))
  .then(() => {
    TEARDOWN_CALLBACKS = [];
  });
};
