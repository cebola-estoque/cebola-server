// native
const util = require('util');

/**
 * Base constructor for errors that happen within InventoryAPI
 * @param {String} message
 */
function InventoryAPIError(message) {
  Error.call(this, message);
}
util.inherits(InventoryAPIError, Error);
InventoryAPIError.prototype.name = 'InventoryAPIError';

/**
 * Happens when any required option is invalid
 *
 * error.option should have the option that is invalid
 * error.kind should contain details on the error type
 * 
 * @param {String} option
 * @param {String} kind
 * @param {String} message
 */
function InvalidOption(option, kind, message) {
  InventoryAPIError.call(this, message);

  this.option = option;
  this.kind = kind;
}
util.inherits(InvalidOption, InventoryAPIError);
InvalidOption.prototype.name = 'InvalidOption';


function ProductNotAvailable(product) {

}
util.inherits(ProductNotAvailable, InventoryAPIError);
ProductNotAvailable.prototype.name = 'ProductNotAvailable';


/**
 * Expose errors
 */
exports.InventoryAPIError = InventoryAPIError;
exports.InvalidOption = InvalidOption;
exports.ProductNotAvailable = ProductNotAvailable;
