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
  InventoryAPIError.call(this, 'product not available');
}
util.inherits(ProductNotAvailable, InventoryAPIError);
ProductNotAvailable.prototype.name = 'ProductNotAvailable';

function EmailTaken(email) {
  InventoryAPIError.call(this, 'email ' + email + ' already in use');

  this.email = email;
}
util.inherits(EmailTaken, InventoryAPIError);
EmailTaken.prototype.name = 'EmailTaken';

function Unauthorized() {
  InventoryAPIError.call(this, 'unauthorized');
}
util.inherits(Unauthorized, InventoryAPIError);
Unauthorized.prototype.name = 'Unauthorized';

/**
 * Expose errors
 */
exports.InventoryAPIError = InventoryAPIError;
exports.InvalidOption = InvalidOption;
exports.ProductNotAvailable = ProductNotAvailable;
exports.EmailTaken = EmailTaken;
exports.Unauthorized = Unauthorized;
