// native dependencies
const http = require('http');

// internal dependencies
const pkg = require('../package.json');
const createCebolaAPI = require('../server');

var options = {
  apiVersion: pkg.version,
  port: process.env.PORT,
  corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS,

  mongodbURI: process.env.MONGODB_URI,
  host: process.env.HOST,
  secret: process.env.SECRET,
  temporaryPassword: process.env.TEMPORARY_PASSWORD,
  temporarySecret: process.env.TEMPORARY_SECRET,

  awsS3Bucket: process.env.AWS_S3_BUCKET,
};

// instantiate the app
var app = createCebolaAPI(options);

// create http server and pass express app as callback
var server = http.createServer(app);

// start listening
server.listen(options.port, function () {
  console.log('CebolaAPI listening at port %s', options.port);
});
