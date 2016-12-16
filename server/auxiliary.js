// third-party
const moment = require('moment');

/**
 * Sets methods on the proxy object
 * that proxy to the proxied object's methods.
 * 
 * @param  {Object} proxy
 * @param  {Object} proxied
 * @param  {Array} methods
 */
exports.proxyMethods = function (proxy, proxied, methods) {

  methods.forEach((methodName) => {
    proxy[methodName] = proxied[methodName].bind(proxied);
  });

};

exports.isSameProduct = function (productA, productB) {
  var isSameModel = productA.model._id.toString() === productB.model._id.toString();
  var isSameExpiry = moment(productA.expiry).isSame(productB.expiry);
  var isSameMeasureUnit = productA.measureUnit === productB.measureUnit;
  
  return isSameModel && isSameExpiry && isSameMeasureUnit;
};
