// third-party dependencies
const mongoose = require('mongoose');
const moment   = require('moment');

// constants
const Schema = mongoose.Schema;
const SHARED_CONSTANTS = require('../../../shared/constants');

const CORRECTABLE_PROPERTIES = [
  'quantity',
  'productExpiry',
  'shipment',
  'productModel',
  'scheduledFor',
  'details',
];

// Object.values might come in es*
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
function _objValues(obj) {
  return Object.keys(obj).map((k) => {
    return obj[k];
  });
}

const STATUSES = _objValues(SHARED_CONSTANTS.RECORD_STATUSES);
const TYPES = _objValues(SHARED_CONSTANTS.RECORD_TYPES);

/**
 * Auxiliary schema that defines an operation
 * 
 * @type {Schema}
 */
var operationSchema = new Schema({
  author: {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    }
  },

  // organization: {
  //   _id: {
  //     type: String,
  //     required: true,
  //   }
  // },

  shipment: {
    _id: {
      type: String,
      required: true,
    },
  },

  productModel: {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    }
  },

  productExpiry: {
    type: Date,
    required: true,
    validate: {
      validator: function (exp) {
        return moment(exp).isAfter(Date.now());
      },
      message: '{VALUE} is an expired date',
    },
  },

  scheduledFor: {
    type: Date,
    required: true,
    validate: {
      validator: function (date) {
        return moment(date).isBefore(moment(this.productExpiry).endOf('day'));
      },
      message: 'The operation scheduling is for after the product\'s expiry {VALUE}'
    }
  },

  tags: [Object],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  type: {
    type: String,
    required: true,
    validate: {
      validator: function (type) {
        return TYPES.indexOf(type) !== -1;
      },
      message: 'Invalid operation type `{VALUE}`'
    }
  },

  quantity: {
    value: {
      type: Number,
      required: true,
      validate: {
        type: 'QuantityAndOperationTypeMismatch',
        validator: function (quantityValue) {
          var type = this.get('type');

          if (type === 'entry') {
            return quantityValue > 0;
          } else if (type === 'exit' || type === 'loss') {
            return quantityValue < 0;
          }
        },
        message: 'quantity.value MUST be positive for type `entry` and negative for type `exit`'
      }
    },
    unit: {
      type: String,
      required: true,
    },
  },

  details: {
    type: Object,
  },

  history: [],

  status: {
    value: {
      type: String,
      required: true,
      validate: {
        validator: function (statusValue) {
          return STATUSES.indexOf(statusValue) !== -1;
        },
        message: 'Invalid operation status `{VALUE}`'
      }
    },
    reason: {
      type: String,
      required: true,
    },
    annotation: {
      type: String,
    }
  },
});

operationSchema.index({
  'productModel.name': 'text',
});

/**
 * Normalize data before validation is run
 */
operationSchema.pre('validate', function (next) {

  /**
   * Ensure productExpiry is set to the
   * end of the day the date refers to.
   */
  this.productExpiry = moment(this.productExpiry).endOf('day');

  next();
});

module.exports = function (conn, app, options) {

  /**
   * Adds the current version of the operation to its history
   * and resets some properties.
   */
  operationSchema.methods.newVersion = function () {

    this.history.push({
      author: {
        _id: this.author._id,
        name: this.author.name,
      },
      productModel: {
        _id: this.productModel._id,
        name: this.productModel.name,
      },
      updatedAt: this.updatedAt,
      type: this.type,
      quantity: {
        value: this.quantity.value,
        unit: this.quantity.unit,
      },
      status: {
        value: this.status.value,
        reason: this.status.reason,
      },
      details: this.details,
    });

    // ensure the following properties are refilled
    this.set('updatedAt', Date.now());
    this.set('details', undefined);
    this.set('status', undefined);
  };

  operationSchema.methods.setStatus = function (status, reason, annotation) {
    this.set('status', {
      value: status,
      reason: reason,
      annotation: annotation,
    });
  };

  operationSchema.methods.setAuthor = function (author) {
    this.set('author', {
      _id: author._id,
      name: author.name,
    });
  };

  operationSchema.methods.setShipment = function (shipment) {
    this.set('shipment', {
      _id: shipment._id,
    });

    /**
     * Operation's type matches the shipment's
     */
    this.set('type', shipment.type);
    /**
     * Operation's scheduledFor matches the shipment's
     */
    this.set('scheduledFor', shipment.scheduledFor);
  };

  /**
   * Method that only picks properties that
   * are actually correctable.
   * @param  {Object} correctionData
   */
  operationSchema.methods.correct = function (correctionData) {
    
    CORRECTABLE_PROPERTIES.forEach((prop) => {
      if (correctionData.hasOwnProperty(prop)) {
        this.set(prop, correctionData[prop]);
      }
    });
  };

  var Operation = conn.model('Operation', operationSchema);
  
  return Operation;
};
