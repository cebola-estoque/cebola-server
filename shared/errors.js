// native
const util = require('util');

/**
 * Base constructor for errors that happen within InventoryAPI
 * @param {String} message
 */
function CebolaAPIError(message) {
  Error.call(this, message);
}
util.inherits(CebolaAPIError, Error);
CebolaAPIError.prototype.name = 'CebolaAPIError';

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
  CebolaAPIError.call(this, message);

  this.option = option;
  this.kind = kind;
}
util.inherits(InvalidOption, CebolaAPIError);
InvalidOption.prototype.name = 'InvalidOption';


function ProductNotAvailable(product) {
  CebolaAPIError.call(this, 'product not available');
}
util.inherits(ProductNotAvailable, CebolaAPIError);
ProductNotAvailable.prototype.name = 'ProductNotAvailable';

function EmailTaken(email) {
  CebolaAPIError.call(this, 'email ' + email + ' already in use');

  this.email = email;
}
util.inherits(EmailTaken, CebolaAPIError);
EmailTaken.prototype.name = 'EmailTaken';

function Unauthorized() {
  CebolaAPIError.call(this, 'unauthorized');
}
util.inherits(Unauthorized, CebolaAPIError);
Unauthorized.prototype.name = 'Unauthorized';

function NotFound(resourceName, resourceIdentifier) {
  CebolaAPIError.call(this, 'resource ' + resourceName + ' not found');

  this.resource = resourceName;
  this.identifier = resourceIdentifier;
}
util.inherits(NotFound, CebolaAPIError);
NotFound.prototype.name = 'NotFound';

/**
 * Expose errors
 */
exports.CebolaAPIError = CebolaAPIError;
exports.InvalidOption = InvalidOption;
exports.ProductNotAvailable = ProductNotAvailable;
exports.EmailTaken = EmailTaken;
exports.Unauthorized = Unauthorized;
exports.NotFound = NotFound;
