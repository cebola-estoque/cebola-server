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
    if (typeof proxied[methodName] !== 'function') {
      throw new TypeError(`${methodName} is not a function`);
    }
    
    proxy[methodName] = proxied[methodName].bind(proxied);
  });
};
