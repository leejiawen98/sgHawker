import mongoose, { Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import _ from "lodash";
import moment from "moment";

import { Constants } from "common";
import { StringHelper } from "helpers";
import settings from "../config/settings";

const Wallet = require("./Wallet");
const Outlet = require("./Outlet");

const stripe = require('stripe')(settings.STRIPE_API_KEY);
const crypto = require('crypto');


const User = new Schema({
  name: { type: String, required: true, trim: true },
  _hashedPassword: { type: String, required: true },
  isVaccinated: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    unique: true,
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  phone: { type: String, index: true },
  addresses: [
    {
      addressId: { type: mongoose.Schema.Types.ObjectId, required: true },
      addressDetails: { type: String, required: true },
      postalCode: { type: String, required: true },
      isDefault: { type: Boolean, required: true }
    }
  ],
  bankAccounts: [
    {
      bankAccountId: { type: mongoose.Schema.Types.ObjectId, required: true },
      fullName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      nameOfBank: { type: String, required: true },
      isDefault: { type: Boolean, required: true },
    }
  ],
  cards: [
    {
      cardId: { type: mongoose.Schema.Types.ObjectId, required: true },
      cardName: { type: String, required: true },
      cardNumber: { type: String, required: true },
      truncatedCardNumber: { type: String, required: true },
      cardType: { type: String, required: true },
      expiryDate: { type: Date, required: true },
      cvv: { type: String, required: true },
      billingAddressDetails: { type: String, required: true },
      billingPostalCode: { type: String, required: true },
      isDefault: { type: Boolean, required: true },
      stripePaymentMethodId: { type: String, required: true },
    }
  ],
  favouriteHawkerCentres: [{ type: String }],
  profileImgSrc: { type: String, default: "" },
  accountTier: {
    type: String,
    enum: [Constants.FREE, Constants.PREMIUM, Constants.DELUXE],
  },
  accountUpgradeStatus: {
    type: String,
    enum: [
      Constants.APPROVED,
      Constants.REJECTED,
      Constants.PENDING
    ],
  },
  subscriptionFees: {
    premium: {
      type: Number
    },
    deluxe: {
      type: Number
    },
  },
  accountStatus: {
    type: String,
    enum: [
      Constants.APPROVED,
      Constants.REJECTED,
      Constants.SUSPENDED,
      Constants.DEACTIVATED,
      Constants.DELETED,
      Constants.PENDING,
      Constants.ACTIVE,
    ],
  },
  accountType: {
    type: String,
    enum: [Constants.CUSTOMER, Constants.HAWKER, Constants.ADMIN],
    required: true,
  },
  currentlyLoggedIn: { type: Boolean, default: false },
  lastLoggedIn: { type: Date, default: new Date() },
  favouriteHawkerStores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
    },
  ],
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet"
  },
  outlets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
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
  stripeCustomerId: { type: String },
  currentBudgetGoal: { type: Number },
  futureBudgetGoal: { type: Number }
});

User.statics.validate = function (user, fields) {
  if (fields.name) {
    if (!user.name) {
      return Constants.ERROR_USER_NAME_REQUIRED;
    }
    if (user.name.trim().length < Constants.USER_NAME_MIN_LENGTH) {
      return Constants.ERROR_USER_NAME_MIN_LENGTH;
    }
  }
  if (fields.email) {
    if (!user.email) {
      return Constants.ERROR_USER_EMAIL_REQUIRED;
    }
    if (!validator.isEmail(user.email)) {
      return Constants.ERROR_USER_EMAIL_INVALID;
    }
    if (user.email.trim().length < Constants.USER_EMAIL_MIN_LENGTH) {
      return Constants.ERROR_USER_EMAIL_MIN_LENGTH;
    }
  }
  if (fields._id) {
    if (!user._id) {
      return Constants.ERROR_USER_ID_REQUIRED;
    }
  }
  if (fields.password) {
    if (!user.password) {
      return Constants.ERROR_USER_PW_REQUIRED;
    }
  }
  if (fields.phone) {
    if (!user.phone) {
      return Constants.ERROR_USER_PHONE_REQUIRED;
    }
    if (!StringHelper.isNumeric(user.phone)) {
      return Constants.ERROR_USER_PHONE_NUMERIC_REQUIRED;
    }
  }
  if (fields.accountTier) {
    if (!user.accountTier) {
      return Constants.ERROR_USER_ACCOUNT_TIER_NOT_FOUND;
    }
  }
  if (fields.accountUpgradeStatus) {
    if (!user.accountUpgradeStatus) {
      return Constants.ERROR_USER_ACCOUNT_TIER_STATUS_NOT_FOUND;
    }
  }
  if (fields.subscriptionFees) {
    if (!user.subscriptionFees) {
      return Constants.ERROR_USER_SUBSCRIPTION_FEES_NOT_FOUND;
    }
  }
  if (fields.accountType) {
    if (!user.accountType) {
      return Constants.ERROR_USER_ACCOUNT_TYPE_NOT_FOUND;
    }
  }
  if (fields.addresses) {
    if (!user.addresses) {
      return Constants.ERROR_USER_ADDRESSES_NOT_FOUND;
    }
  }
  if (fields.cards) {
    if (!user.cards) {
      return Constants.ERROR_USER_CARDS_NOT_FOUND;
    }
  }
  if (fields.favouriteHawkerCentres) {
    if (!user.favouriteHawkerCentres) {
      return Constants.ERROR_USER_FAVOURITED_CENTRES_NOT_FOUND;
    }
  }
  if (fields.favouriteHawkerStores) {
    if (!user.favouriteHawkerStores) {
      return Constants.ERROR_USER_FAVOURITED_STORES_NOT_FOUND;
    }
  }
  // if (fields.cards) {
  //   if (!user.cards) {
  //     return Constants.ERROR_USER_ACCOUNT_TYPE_NOT_FOUND;
  //   }
  // }
  // if (fields.favouriteHawkerCentres) {
  //   if (!user.favouriteHawkerCentres) {
  //     return Constants.ERROR_USER_ACCOUNT_TYPE_NOT_FOUND;
  //   }
  // }
  // if (fields.favouriteHawkerStores) {
  //   if (!user.favouriteHawkerStores) {
  //     return Constants.ERROR_USER_ACCOUNT_TYPE_NOT_FOUND;
  //   }
  // }
  return null;
};

// customer system related methods

User.statics.createCustomer = function (customerData) {
  return bcrypt.hash(customerData.password, 8).then((hashedPassword) => {
    delete customerData.password;
    const hashedCustomer = {
      ...customerData,
      accountType: Constants.CUSTOMER,
      accountStatus: Constants.ACTIVE,
      _hashedPassword: hashedPassword,
    };
    return this.create(hashedCustomer);
  });
};

async function addStripePaymentMethod(user, updateDetails) {
  let userStripeId = user.stripeCustomerId;
  if (userStripeId === undefined) {
    const customer = await stripe.customers.create({
      email: user.email,
    });
    userStripeId = customer.id;
  }
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: updateDetails.cardNumber,
      exp_month: parseInt(updateDetails.expiryDate.substring(5)),
      exp_year: parseInt(updateDetails.expiryDate.substring(0, 4)),
      cvc: updateDetails.cvv
    }
  })
  await stripe.paymentMethods.attach(paymentMethod.id, { customer: userStripeId });
  return {stripeId: userStripeId, paymentMethodId: paymentMethod.id};
}

function encrypt (iv, text) {
  const cipher = crypto.createCipheriv(settings.ENCRYPT_ALGORITHM, settings.ENCRYPT_SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted.toString('hex');
}

User.statics.addUserCard = function (userId, updateDetails) {
  return this.findById(userId).then(user => {
    return addStripePaymentMethod(user, updateDetails).then(details => {
      const iv = crypto.randomBytes(parseInt(settings.ENCRYPT_BYTES));
      const encryptedCardNumber = encrypt(iv, updateDetails.cardNumber.toString());
      const encryptedCvv = encrypt(iv, updateDetails.cvv.toString());
      delete updateDetails.cardNumber;
      delete updateDetails.cvv;
      const encryptedCard = {
        ...updateDetails,
        cardNumber: encryptedCardNumber,
        cvv: encryptedCvv,
        truncatedCardNumber: iv.toString('hex'),
        stripePaymentMethodId: details.paymentMethodId,
      };
      const update = {
        $push: { cards: encryptedCard },
        $set: { stripeCustomerId: details.stripeId }
      };
      const options = {
        new: true,
      };
      return this.findByIdAndUpdate(userId, update, options).exec();
    });
  })
}

function decrypt (encryptedCardNumber, cardIv) {
  const decipher = crypto.createDecipheriv(settings.ENCRYPT_ALGORITHM, settings.ENCRYPT_SECRET_KEY, Buffer.from(cardIv, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedCardNumber, 'hex')), decipher.final()]);
  return decrypted.toString();
}

User.statics.findAllCardsByCustomerId = function (userId) {
  return this.findById(userId).then(user => {
    let cards = user.cards;
    cards = cards.map(card => {
      const cardIv = card.truncatedCardNumber
      const decryptedCardNumber = "**** **** **** " + decrypt(card.cardNumber, cardIv).substring(12);
      return {
        _id: card._id,
        cardName: card.cardName,
        cardNumber: decryptedCardNumber,
        cardType: card.cardType,
        expiryDate: card.expiryDate,
        billingAddressDetails: card.billingAddressDetails,
        billingPostalCode: card.billingPostalCode,
        isDefault: card.isDefault,
        stripePaymentMethodId: card.stripePaymentMethodId
      }
    });
    return cards;
  })
}


User.statics.editUserCard = function (userId, updateDetails) {
  const update = {
    $set: { cards: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.removeUserCard = function (userId, updateDetails) {
  const update = {
    $pull: { cards: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.addUserBankAccount = function (userId, updateDetails) {
  const update = {
    $push: { bankAccounts: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.editUserBankAccount = function (userId, updateDetails) {
  const update = {
    $set: { bankAccounts: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.removeUserBankAccount = function (userId, updateDetails) {
  const update = {
    $pull: { bankAccounts: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.addUserFavouriteCentre = function (userId, updateDetails) {
  const update = {
    $push: { favouriteHawkerCentres: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.addUserFavouriteStore = function (userId, updateDetails) {
  const update = {
    $push: { favouriteHawkerStores: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.removeUserFavouriteCentre = function (userId, updateDetails) {
  const update = {
    $pull: { favouriteHawkerCentres: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.removeUserFavouriteStore = function (userId, updateDetails) {
  const update = {
    $pull: { favouriteHawkerStores: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.updateUserProfileDetails = function (userId, updateDetails) {
  const update = {
    $set: { ...updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

User.statics.updateFutureBudgetGoal = function (userId, updateDetails) {
  const update = {
    $set: { futureBudgetGoal: updateDetails },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options).exec();
};

// Customer Management

User.statics.findAllCustomerAccounts = function () {
  const options = { select: { _hashedPassword: 0 } };
  return this.find({ accountType: Constants.CUSTOMER }, options);
};

User.statics.updateCustomerAccountStatus = function (customerId, acctStatus) {
  const update = {
    $set: {
      accountStatus: acctStatus,
    },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(customerId, update, options).exec();
};

User.statics.updateCustomerVaccinationStatus = function (customerId, vaccinationStatus) {
  const update = {
    $set: {
      isVaccinated: vaccinationStatus,
    },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(customerId, update, options).exec();
};

User.statics.updateCustomerAccount = function (customerId, updateDetails) {
  const update = {
    $set: { ...updateDetails }
  };
  const options = {
    new: true
  };
  return this.findByIdAndUpdate(customerId, update, options).exec();
};

// admin system related methods

User.statics.createAdmin = function () {
  return bcrypt.hash(settings.ADMIN_PASSWORD, 8).then((hashedPassword) => {
    const hashedUser = {
      name: "ADMIN",
      accountType: Constants.ADMIN,
      accountStatus: Constants.ACTIVE,
      email: settings.ADMIN_EMAIL,
      _hashedPassword: hashedPassword,
      subscriptionFees: {
        premium: 50,
        deluxe: 100
      }

    };
    return this.create(hashedUser);
  });
};

User.statics.updateSubscriptionFees = function (subscriptionFees) {
  const update = {
    $set: {
      subscriptionFees: subscriptionFees,
    },
  };
  const options = {
    new: true,
  };

  const filter = {
    accountType: Constants.ADMIN
  }

  return this.findOneAndUpdate(filter, update, options).exec();
};

/**
 * @param {*} User
 * @returns create hawker account
 */

User.statics.createHawker = function (hawkerData) {
  return bcrypt.hash(hawkerData.password, 8).then((hashedPassword) => {
    delete hawkerData.password;
    const hashedHawker = {
      ...hawkerData,
      accountType: Constants.HAWKER,
      accountStatus: Constants.PENDING,
      _hashedPassword: hashedPassword,
    };
    return this.create(hashedHawker);
  });
};

/**
 * @returns all hawker accounts in the system
 */
User.statics.findAllHawkerAccounts = function () {
  const options = { select: { _hashedPassword: 0 } };
  return this.find({ accountType: Constants.HAWKER }, options);
};

/**
 * @param {*} hawkerId
 * @returns approved/rejected/active hawker account
 */
User.statics.updateAccountStatus = function (hawkerId, acctStatus) {
  const update = {
    $set: {
      accountStatus: acctStatus,
    },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(hawkerId, update, options).exec();
};

/**
 * @param {*} hawker
 * @returns update account tier request
 */
User.statics.updateAccountTier = function (hawkerId, acctTierStatus, newAccountTier, masterOutletId) {
  // finds masterOutletId and set as master outlet; if null, method does not do anything
  // if downgrade -> deactivating of the master outlet is done in Wallet.updateSubscriptionPaymentDue, simply ignore this step
  return Outlet.setOutletAsMaster(masterOutletId, true).then((outlet) => {
    return this.findHawkerAccount(hawkerId).then((hawker) => {

      // rejected deluxe, downgrade back to initial tier, dont update subscriptionPaymentDue
      if (newAccountTier === hawker.accountTier)  {
        Outlet.setOutletAsMaster(masterOutletId, false);
      }
      else if (acctTierStatus === Constants.APPROVED) {
        if (newAccountTier === Constants.DELUXE) {
          // upgrade to deluxe
          Wallet.updateSubscriptionPaymentDue(outlet.wallet, hawker.accountTier, newAccountTier);
        } else {
          // downgrade from deluxe
          if (hawker.accountTier === Constants.DELUXE) {
              Outlet.deleteNonMasterOutlets(hawkerId).then(nonMasterOutlets => {
              const outlet = hawker.outlets.find((outlet) => !outlet.isDeleted);
              Wallet.updateSubscriptionPaymentDue(outlet.wallet, hawker.accountTier, newAccountTier);  
            });
          // FREE to PREMIUM || PREMIUM to FREE
          } else {
            const outlet = hawker.outlets.find((outlet) => !outlet.isDeleted);
            Wallet.updateSubscriptionPaymentDue(outlet.wallet, hawker.accountTier, newAccountTier);
          }
        }
      }
      let update = {
        $set: {
          accountUpgradeStatus: acctTierStatus,

          // FOR DELUXE:
          // if acctTierStatus is pending, sets AccountTier to original hawker tier
          // only when approved, then accountTier will be set to DELUXE
          // FOR FREE/PREMIUM:
          // acctTierStatus will always be approved; thus accountTier is set as the newAccountTier
          accountTier: acctTierStatus === Constants.PENDING ? hawker.accountTier : newAccountTier,
        },
      };
      const options = {
        new: true,
      };
      return this.findByIdAndUpdate(hawkerId, update, options).exec();
    });
  });
}

/**
 * @returns admin account
 */
User.statics.findAdminAccount = function () {

  let adminFilter = {
    accountType: Constants.ADMIN,
  }

  return this.findOne(adminFilter).populate("wallet").exec();
}

/**
 * @returns hawker account by id
 */
User.statics.findHawkerAccount = function (hawkerId) {
  return this.findById(hawkerId).populate("outlets").exec();
};
/**
 * @returns updated hawker account
 */
User.statics.updateHawkerAccount = function (hawkerId, newHawker) {
  const update = {
    $set: {
      email: newHawker.email,
      name: newHawker.name,
      phone: newHawker.phone,
      accountStatus: newHawker.accountStatus,
      accountTier: newHawker.accountTier,
    },
  };
  return this.findByIdAndUpdate(hawkerId, update, { new: true }).exec();
};

// shared methods

User.statics.checkExists = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

User.statics.findOneByEmail = function (email) {
  const options = { select: { _hashedPassword: 0 } };
  return this.findOne({ email: email.toLowerCase() }, options);
};

User.statics.findByUserId = function (userId) {
  const options = { select: { _hashedPassword: 0 } };
  return this.findById(userId, options);
};

User.statics.findAllAdmins = function () {
  const options = { select: { _hashedPassword: 0 } };
  return this.find({ accountType: Constants.ADMIN }, options);
};

User.statics.updateCurrentlyLoggedIn = function (userId, isLoggedIn) {
  const update = {
    $set: {
      currentlyLoggedIn: isLoggedIn,
    },
  };
  return this.findByIdAndUpdate(userId, update).exec();
};

User.statics.updateLastLoggedIn = function (userId) {
  const update = {
    $set: {
      lastLoggedIn: new Date().setMilliseconds(0),
    },
  };
  const options = {
    useFindAndModify: false,
    new: true,
  };
  return this.findByIdAndUpdate(userId, update, options);
};

User.statics.changePassword = function (userId, { password }) {
  return Promise.resolve()
    .then(() => bcrypt.hash(password, 8))
    .then((hashedPassword) => {
      const update = {
        $set: {
          _hashedPassword: hashedPassword,
        },
      };

      const options = {
        select: { _hashedPassword: 0 },
      };

      return Promise.resolve(
        this.findByIdAndUpdate(userId, update, options).exec()
      );
    });
};

/**
System
*/

User.statics.updateHawkerAccountStatusForTimeout = function () {
  const limit = settings.ACCOUNT_INACTIVITY_LIMIT_IN_DAYS;

  const limitDateTime = moment().subtract(limit, "days");

  const condition = {
    accountType: Constants.HAWKER,
    currentlyLoggedIn: false,
    lastLoggedIn: { $lt: limitDateTime.toDate() },
  };
  const markAsInactive = {
    $set: {
      accountStatus: Constants.DEACTIVATED,
    },
  };
  return this.updateMany(condition, markAsInactive);
};

User.statics.debitFromWalletToBankAccountForTimeOut = function () {
  const Wallet = require("./Wallet");

  const filter = {
    accountType: Constants.HAWKER
  };

  return this
    .find(filter)
    .then(hawkerAccounts => {
      for (const hawker of hawkerAccounts) {

        let defaultBankAccount = hawker.bankAccounts.filter(x => x.isDefault)[0];
        if (!defaultBankAccount) {
          continue;
        }

        for (const outlet of hawker.outlets) {
          Wallet.debitFromWalletToBankAccountByOutletId(outlet, defaultBankAccount);
        }
      }
    })
};

User.statics.debitSubscriptionFeeForTimeOut = function () {
  const Wallet = require("./Wallet");

  return this.findAdminAccount().then((admin) => {
    const filter = {
      accountType: Constants.HAWKER,
      // accountTier: {
      //   $in: [Constants.DELUXE, Constants.PREMIUM]
      // },
      accountUpgradeStatus: Constants.APPROVED
    };
    return this.find(filter)
    .populate("outlets")
    .then((hawkerAccounts) => {
      for (const hawker of hawkerAccounts) {
        let defaultCreditCard = hawker.cards.filter(x => x.isDefault && x.stripePaymentMethodId !== undefined)[0];
        if (!defaultCreditCard) {
          continue;
        }
        let subscriptionFee = 0;
        if (hawker.accountTier === Constants.PREMIUM) {
          subscriptionFee = admin.subscriptionFees.premium;
          const outlets = hawker.outlets.filter((outlet) => !outlet.isDeleted);
          Wallet.debitSubscriptionFeeByOutletId(outlets[0]._id, defaultCreditCard, subscriptionFee, hawker.stripeCustomerId);

        } else if (hawker.accountTier === Constants.DELUXE) {
          subscriptionFee = admin.subscriptionFees.deluxe;
          for (const outlet of hawker.outlets) {
            if (outlet.isMaster && !outlet.isDeleted) {
              Wallet.debitSubscriptionFeeByOutletId(outlet._id, defaultCreditCard, subscriptionFee, hawker.stripeCustomerId);
            }
          }
        } else if (hawker.accountTier === Constants.FREE) {
          const outlets = hawker.outlets.filter((outlet) => !outlet.isDeleted);
          Wallet.debitSubscriptionFeeByOutletId(outlets[0]._id, defaultCreditCard, subscriptionFee, hawker.stripeCustomerId);
        }
      }
    });
  });
};

User.statics.updateCustomerBudgetGoalsForTimeout = function () {

  const condition = {
    accountType: Constants.CUSTOMER,
  };
  const updateBudgetGoal = {
    $set: {
      currentBudgetGoal: futureBudgetGoal,
      futureBudgetGoal: 0,
    },
  };
  return this.updateMany(condition, updateBudgetGoal);
};


//LEADERBOARD
User.statics.findNumOfFavouritesForAllHawkers = function () {

  return this.aggregate(
    [
      {
        $unwind: '$favouriteHawkerStores'
      },
      {
        $lookup: {
          from: 'Outlet',
          localField: 'favouriteHawkerStores',
          foreignField: '_id',
          as: 'Outlet'
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'Outlet.hawkerAccount',
          foreignField: '_id',
          as: 'Hawker'
        }
      },
      {
        $unwind: "$Outlet"
      },
      {
        $unwind: "$Hawker"
      },
      {
        $match: {
          $and: [
            { "Hawker.accountStatus": 'ACTIVE' }
          ]
        }
      },
      {
        $group:
          { _id: '$Outlet._id', outletName: { $first: '$Outlet.outletName' }, outletPic: { $first: '$Hawker.profileImgSrc' }, hawkerCentreName: { $first: '$Outlet.hawkerCentreName' }, numOfSales: { $sum: 1 }, }
      },
      { $sort: { numOfSales: -1 } }
    ]
  );
};

User.statics.findNumOfFavouritesForAllHawkerCentres = function () {

  return this.aggregate(
    [
      {
        $unwind: '$favouriteHawkerCentres'
      },
      {
        $group:
          { _id: '$favouriteHawkerCentres', hawkerCentreName: { $first: '$favouriteHawkerCentres' }, numOfSales: { $sum: 1 }, }
      },
      { $sort: { numOfSales: -1 } }
    ]
  );
};

export default mongoose.model("User", User, "User");
