module.exports = function (app, options) {

  app.services = {};

  // setup mongoose before cebola
  require('./mongoose')(app, options);
  require('./cebola')(app, options);
  require('./upload')(app, options);
};
