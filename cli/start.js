// native dependencies
const http = require('http');

// internal dependencies
const pkg = require('../package.json');
const createInventoryAPI = require('../server');

var options = {
  apiVersion: pkg.version,
  port: process.env.PORT,
  corsWhitelist: process.env.CORS_WHITELIST,

  mongodbURI: process.env.MONGODB_URI,
  secret: process.env.SECRET,
};

// instantiate the app
var app = createInventoryAPI(options);

// create http server and pass express app as callback
var server = http.createServer(app);

// start listening
server.listen(options.port, function () {
  console.log('InventoryAPI listening at port %s', options.port);
});