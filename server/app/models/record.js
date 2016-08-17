// third-party dependencies
const mongoose = require('mongoose');
const moment   = require('moment');

// constants
const Schema = mongoose.Schema;
const SHARED_CONSTANTS = require('../../../shared/constants');

/**
 * Auxiliary schema that defines an operation
 * 
 * @type {Schema}
 */
var recordSchema = new Schema({
  author: {
    type: require('./sub-schemas/author'),
  },

  invoice: {
    _id: {
      type: String,
      required: true,
    },
    source: {
      _id: {
        type: String,
        required: true,
      },
    },
    destination: {
      _id: {
        type: String,
        required: true,
      }
    }
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
    // required: true,
    validate: {
      validator: function (date) {
        return moment(date).isBefore(moment(this.productExpiry).endOf('day'));
      },
      message: 'The record scheduling is for after the product\'s expiry {VALUE}'
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
  },

  quantity: {
    value: {
      type: Number,
      required: true,
      validate: {
        validator: function (quantityValue) {
          if (this.get('type') === 'entry') {
            return quantityValue > 0;
          } else if (this.get('type') === 'exit') {
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

/**
 * Normalize data before validation is run
 */
recordSchema.pre('validate', function (next) {

  /**
   * Ensure productExpiry is set to the
   * end of the day the date refers to.
   */
  this.productExpiry = moment(this.productExpiry).endOf('day');

  next();
});

module.exports = function (conn, app, options) {

  /**
   * Adds the current version of the record to its history
   * and resets some properties.
   */
  recordSchema.methods.newVersion = function () {

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

  recordSchema.methods.setStatus = function (status, reason, annotation) {
    this.set('status', {
      value: status,
      reason: reason,
      annotation: annotation,
    });
  };

  var Record = conn.model('Record', recordSchema);
  
  return Record;
};
