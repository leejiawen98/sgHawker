import mongoose, { Schema } from "mongoose";
import { Constants } from "common";
import { StringHelper } from "helpers";
import * as _ from "lodash";

const Outlet = new Schema({
  outletName: { type: String, required: true, trim: true },
  outletAddress: { type: String, required: true },
  outletContactNumber: { type: String },
  cashbackRate: {
    type: Number,
    default: 0,
  },
  cashbackIsActive: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  hawkerCentreName: {
    type: String,
    required: true
  },
  businessHrsOption: { type: String },
  outletOperatingHrs: [
    {
      day: {
        type: String,
        required: true
      }, 
      startTime: {
        type: Date,
        required: true
      },
      endTime: {
        type: Date,
        required: true
      },
      businessStatus: {
        type: Boolean,
        required: true,
        default: true
      }
    }
  ],
  cuisineType: {
    type: Array,
    default: [],
  },
  isMaster: {
    type: Boolean,
    default: false
  },
  hawkerAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  queueSetting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QueueSetting',
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet"
  },
  menus: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
    },
  ],
  foodItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  ],
  goals: [
    {
      goalStartDate: {
        type: Date,
      },
      goalEndDate: {
        type: Date,
      },
      goalPeriod: {
        type: String,
        required: true,
        enum: [Constants.TARGETED, Constants.DAILY, Constants.WEEKLY, Constants.MONTHLY, Constants.YEARLY]
      },
      goalCategory: {
        type: String,
        required: true,
        enum: [Constants.SALES, Constants.EARNINGS]
      },
      targetAmount: {
        type: Number,
        required: true,
      },
      color: {
        type: String,
        required: true,
      }
    },
  ],
});

Outlet.statics.validate = function (outlet, fields) {
  if (fields.outletName) {
    if (!outlet.outletName) {
      return Constants.ERROR_OUTLET_NAME_REQUIRED;
    }
  }
  if (fields.outletAddress) {
    if (!outlet.outletAddress) {
      return Constants.ERROR_OUTLET_ADDRESS_REQUIRED;
    }
  }
  if (fields.hawkerCentreName) {
    if (!outlet.hawkerCentreName) {
      return Constants.ERROR_OUTLET_HAWKER_CENTRE_REQUIRED;
    }
  }
  if (fields.outletContactNumber) {
    if (!outlet.outletContactNumber) {
      return Constants.ERROR_OUTLET_CONTACT_NUMBER_REQUIRED;
    }
    if (!StringHelper.isNumeric(outlet.outletContactNumber)) {
      return Constants.ERROR_OUTLET_CONTACT_NUMBER_NUMERIC_REQUIRED;
    }
  }
  if (fields.hawker) {
    if (!outlet.hawker) {
      return Constants.ERROR_OUTLET_HAWKER_REQUIRED;
    }
  }
  if (fields.cuisineType) {
    if (outlet.cuisineType.length === 0) {
      return Constants.ERROR_OUTLET_CUISINE_TYPE_REQUIRED;
    }
  }
  if (fields._id) {
    if (!outlet._id) {
      return Constants.ERROR_OUTLET_INVALID_ID_PROVIDED;
    }
  }
  if (fields.cashbackRate) {
    if (!outlet.cashbackRate) {
      return Constants.ERROR_OUTLET_CASHBACK_RATE_REQUIRED;
    }
    if (outlet.cashbackRate > 1 || outlet.cashbackRate < 0) {
      return Constants.ERROR_CASHBACK_RATE_OUT_OF_RANGE;
    }
  }
  if (fields.goal) {
    if (!outlet.goalCategory) {
      return Constants.ERROR_MISSING_GOAL_CATEGORY;
    }
    if (!outlet.targetAmount) {
      return Constants.ERROR_MISSING_GOAL_TARGET_AMOUNT;
    }
  }
  return null;
};

/**
 *
 * @param {*} outlet
 * @param {*} hawkerId
 * @returns newly created outlet associated with hawker account
 *
 */
Outlet.statics.createOutlet = function (outlet, hawkerId) {
  const outletData = {
    ...outlet,
    hawkerAccount: hawkerId,
  };

  return Promise.resolve()
    .then(() => this.create(outletData))
    .then((newOutlet) => {
      // update hawker account with outlet
      const update = {
        $set: { accountStatus: Constants.ACTIVE },
        $push: { outlets: newOutlet._id },
      };

      const options = {
        new: true,
      };

      const User = require("./User");
      User.findByIdAndUpdate(hawkerId, update, options).exec();
      return newOutlet;
    });
};

/**
 * soft delete an outlet
 * @param {*} outletId
 * @returns
 */
Outlet.statics.deleteOutlet = function (outletId) {
  const update = {
    $set: { isDeleted: true },
  };

  const options = {
    new: true,
  };

  return this.findByIdAndUpdate(outletId, update, options).exec();
};

/**
 *
 * @param {*} outletId
 * @returns outlet by outlet id
 */
Outlet.statics.findOutletById = function (outletId) {
  return this
    .findById(outletId)
    .populate('queueSetting')
    .populate('wallet')
    .populate('hawkerAccount')
    .populate('menus')
    .populate('foodItems')
    .populate('orders')
    .populate({
      path: 'wallet',
      populate: {
        path: 'walletTransactions',
      }
    })
    .exec();
};

/**
 *
 * @param {*} hawkerId
 * @returns non-deleted outlets associated with the hawker account
 *
 */
Outlet.statics.findOutletsByHawkerId = function (hawkerId) {
  const filter = {
    hawkerAccount: mongoose.Types.ObjectId(hawkerId),
    isDeleted: false,
  };
  return this
    .find(filter)
    .populate('queueSetting')
    .populate('wallet')
    .populate('hawkerAccount')
    .populate('menus')
    .populate('foodItems')
    .populate('orders')
    .exec();
};

/**
 *
 * @param {*} hawkerId
 * @returns 
 */
 Outlet.statics.deleteNonMasterOutlets = function (hawkerId) {

  const filter = {
    hawkerAccount: mongoose.Types.ObjectId(hawkerId),
    isDeleted: false,
    isMaster: false
  };
  return this
  .find(filter).then((nonMasterOutlets) => {
    const update = {
      $set: {
        isDeleted: true
      },
    };
    for (let outlet of nonMasterOutlets) {
      this.findByIdAndUpdate(outlet._id, update).exec();
    } 
    return nonMasterOutlets;
  });
};


/**
 *
 * @param {*} outletId
 * @param {*} newOutlet
 * @returns set master outlet
 */
Outlet.statics.setOutletAsMaster = function (masterOutletId, status) {

  const update = {
    $set: {
      isMaster: status
    },
  };
  const options = {
    new: true,
  };

  return this
    .findByIdAndUpdate(masterOutletId, update, options).exec();
};

/**
 *
 * @param {*} outletId
 * @param {*} newOutlet
 * @returns updated outlet
 */
Outlet.statics.updateOutlet = function (outletId, newOutlet) {
  const update = {
    $set: {
      outletName: newOutlet.outletName,
      outletAddress: newOutlet.outletAddress,
      hawkerCentreName: newOutlet.hawkerCentreName,
      outletContactNumber: newOutlet.outletContactNumber,
      businessHrsOption: newOutlet.businessHrsOption,
      outletOperatingHrs: newOutlet.outletOperatingHrs,
      cuisineType: newOutlet.cuisineType,
      isDeleted: newOutlet.isDeleted,
      isMaster: newOutlet.isMaster
    },
  };
  const options = {
    new: true,
  };

  return this
    .findByIdAndUpdate(outletId, update, options)
    .populate('queueSetting')
    .populate('wallet')
    .populate('hawkerAccount')
    .populate('menus')
    .populate('foodItems')
    .populate('orders')
    .exec();
};

Outlet.statics.updateOutletCashback = function (outletId, cashbackRate, cashbackIsActive) {
  let update;

  if (cashbackRate && cashbackIsActive) {
    update = {
      $set: {
        cashbackRate: cashbackRate,
        cashbackIsActive: cashbackIsActive
      }
    }
  } else if (!cashbackIsActive) {
    update = {
      $set: {
        cashbackIsActive: cashbackIsActive,
      }
    }
  } else if (cashbackRate) {
    update = {
      $set: {
        cashbackRate: cashbackRate,
      }
    }
  }

  const options = {
    new: true,
  };

  return this
    .findByIdAndUpdate(outletId, update, options)
    .populate('queueSetting')
    .populate('wallet')
    .populate('hawkerAccount')
    .populate('menus')
    .populate('foodItems')
    .populate('orders')
    .exec();
};

Outlet.statics.updateFoodItemsInOutlet = function (outletId, newOutlet) {
  const update = {
    $set: {
      foodItems: newOutlet.foodItems
    },
  };
  const options = {
    new: true,
  };

  return this
    .findByIdAndUpdate(outletId, update, options)
    .populate('queueSetting')
    .populate('wallet')
    .populate('hawkerAccount')
    .populate('menus')
    .populate('foodItems')
    .populate('orders')
    .exec();
};


/**
 * @returns all non deleted outlets
 */
Outlet.statics.findAllActiveOutlets = function () {
  const filter = {
    isDeleted: false,
  };
  return this
    .find(filter)
    .populate('wallet')
    .populate('queueSetting')
    .populate('hawkerAccount')
    .populate('menus')
    .populate('foodItems')
    .populate('orders')
    .populate({
      path: 'wallet',
      populate: {
        path: 'walletTransactions',
        options: { sort: { 'transactionDate': -1 } }
      }
    });
};

/**
 * Order related
 */

/**
 *
 * @returns all active outlets
 */
Outlet.statics.findAllHawkerCenters = function () {
  const filter = {
    isDeleted: false,
  };
  return this.find(filter)
    .exec()
};

/**
 * Hawker Analytic: Goals
 */

Outlet.statics.addGoal = function (outletId, newGoal) {  
  const update = {
    $push: { goals: newGoal },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(outletId, update, options)    
  .populate('queueSetting')
  .populate('wallet')
  .populate('hawkerAccount')
  .populate('menus')
  .populate('foodItems')
  .populate('orders')
  .exec();
}

Outlet.statics.updateGoal = function (outletId, updatedGoal) {
  const update = {
    $set: { 
      'goals.$[goalFilter]' : updatedGoal
     },
  };
  const options = {
    arrayFilters: [{ "goalFilter._id": updatedGoal._id }],
    new: true,
  };
  return this.findByIdAndUpdate(outletId, update, options)  
  .populate('queueSetting')
  .populate('wallet')
  .populate('hawkerAccount')
  .populate('menus')
  .populate('foodItems')
  .populate('orders')
  .exec();
}

Outlet.statics.synchronizeSetCashback = function (
  outletIdArray, 
  cashbackIsActive, 
  cashbackRate 
) {
  const filterCondition = {
    _id: {
      $in: outletIdArray,
    },
  };
  const update = {
    $set: { 
      cashbackIsActive: cashbackIsActive,
      cashbackRate: cashbackRate
     },
  };

  return this.updateMany(filterCondition, update).exec();
};

export default mongoose.model("Outlet", Outlet, "Outlet");
