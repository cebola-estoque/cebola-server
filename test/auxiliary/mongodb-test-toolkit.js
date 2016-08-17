// third-party dependencies
const MongoClient = require('mongodb').MongoClient;

const Bluebird = require('bluebird');

function MongodbTestToolkit(options) {
  if (!options.mongodbURI) {
    throw new Error('mongodbURI is required');
  }
}

MongodbTestToolkit.prototype.connect = function () {

};

MongodbTestToolkit.prototype.start = function () {

};

MongodbTestToolkit.prototype.drop = function () {

};

MongodbTestToolkit.prototype.
