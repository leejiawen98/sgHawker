const AppConstants = {
  // account tier

  FREE: "FREE",
  PREMIUM: "PREMIUM",
  DELUXE: "DELUXE",

  // account type

  CUSTOMER: "CUSTOMER",
  HAWKER: "HAWKER",
  ADMIN: "ADMIN",

  // Account status
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  DEACTIVATED: "DEACTIVATED",
  DELETED: "DELETED",
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",

  // sendgrid
  EMAIL_SENDER_ADDRESS: "sghawkers@outlook.com",
  EMAIL_SENDER_NAME: "sgHawkerSupport",

  // ORDER
  DINE_IN: "DINE_IN",
  DELIVERY: "DELIVERY",
  TAKE_AWAY: "TAKE_AWAY",
  /**
  UNPAID -> RECEIVED -> PREPARING -> READY -> COMPLETED
  PAID -> RECEIVED -> PREPARING -> READY -> COMPLETED
  CASH ORDER -> CANCELLED
  DIGITAL ORDER -> REFUNDING -> REFUNDED
  UNPAID -> PAID -> RECEIVED -> PREPARING -> READY -> ACCEPTED -> PICKED_UP -> ON_THE_WAY -> DELIVERED -> COMPLETED
  PAID -> RECEIVED -> PREPARING -> READY -> ACCEPTED -> PICKED_UP -> ON_THE_WAY -> DELIVERED -> COMPLETED
  */
  UNPAID: "UNPAID",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  RECEIVED: "RECEIVED",
  PREPARING: "PREPARING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  REFUNDING: "REFUNDING",
  REFUNDED: "REFUNDED",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
  ON_THE_WAY: "ON_THE_WAY",
  DELIVERED: "DELIVERED",

  // payment type
  DIGITAL: "DIGITAL",
  CASH: "CASH",
  // Order item status
  NEW: "NEW",
  PREPARING: "PREPARING",
  READY: "READY",
  NOT_AVAILABLE: "NOT_AVAILABLE",

  // Queue Generation Settings
  ORDER_TIME: "ORDER_TIME",
  SIMILAR_ITEM: "SIMILAR_ITEM",
  BY_DELIVERY: "BY_DELIVERY",
  BY_NOT_DELIVERY: "BY_NOT_DELIVERY",
  BY_DINE_IN: "BY_DINE_IN",
  BY_NOT_DINE_IN: "BY_NOT_DINE_IN",

  // WalletTransaction
  TOP_UP: "TOP_UP",
  WITHDRAWAL: "WITHDRAWAL",
  ORDER: "ORDER",
  REFUND: "REFUND",
  SUBSCRIPTION_PAYMENT: "SUBSCRIPTION_PAYMENT",
  DELIVERY: "DELIVERY",

  // Report type
  FEEDBACK: "FEEDBACK",
  COMPLAINT: "COMPLAINT",

  // Complaint category

  // food & order related
  POOR_ARRIVED_FOOD_CONDITION: "POOR_ARRIVED_FOOD_CONDITION",
  INCORRECT_FOOD_PREPARATION: "INCORRECT_FOOD_PREPARATION",
  MISSING_ORDER_ITEM: "MISSING_ORDER_ITEM",
  WRONG_ORDER: "WRONG_ORDER",
  MISSING_ORDER: "MISSING_ORDER",
  SAFETY: "SAFETY",
  // delivery related
  LONG_DELIVERY: "LONG_DELIVERY",
  MISSING_DELIVERY: "MISSING_DELIVERY",
  // outlet related
  INCORRECT_OUTLET_INFO: "INCORRECT_OUTLET_INFO",
  // general
  POOR_SERVICE: "POOR_SERVICE",
  // payment
  INCORRECT_PAYMENT: "INCORRECT_PAYMENT",
  INCORRECT_CASHBACK: "INCORRECT_CASHBACK",
  OTHERS: "OTHERS",

  // report status
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  EMAIL: "EMAIL",
  REFUNDED: "REFUNDED"
};

export default AppConstants;
