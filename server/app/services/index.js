module.exports = function (app, options) {

  app.services = {};

  require('./mongoose')(app, options);
};
