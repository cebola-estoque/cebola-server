// third-party
const Bluebird = require('bluebird');

module.exports = function (app, options) {

  return Bluebird.all([
	  require('./mongoose')(app, options),
	  require('./upload')(app, options),
  ])
  .then((services) => {

  	app.services = {};

  	app.services.mongoose = services[0];
  	app.services.upload   = services[1];

  	return Bluebird.all([
	  	require('./cebola')(app, options)
  	])
  })
  .then((services) => {
  	app.services.cebola = services[0];
  })
};
