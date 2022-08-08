import { ResponseHelper } from "helpers";
import { ClientError, Constants } from "common";
import { Order, Outlet, Menu, Wallet } from "models";
import moment from "moment";
import * as _ from "lodash";

const { emitMessage } = require("../config/websocket");
const HawkerStore = require("../models/submodels/HawkerStore");
const DeliveryHawkerCenter = require("../models/submodels/DeliveryHawkerCenter");
const HawkerCenter = require("../models/submodels/HawkerCenter");

const DEBUG_ENV = "OrderController";

const OrderController = {
  request: {},
};

OrderController.request.createNewOrder = function (req, res) {
  const reqError = Order.validate(req.body, {
    customer: true,
    outlet: true,
    totalPrice: true,
    orderType: true,
    items: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.createNewOrder(req.body).then(
    (createdOrder) => {
      ResponseHelper.success(res, createdOrder);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

OrderController.request.createNewGuestHawkerOrder = function (req, res) {
  const reqError = Order.validate(req.body, {
    outlet: true,
    totalPrice: true,
    orderType: true,
    items: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.createNewOrder(req.body).then(
    (createdOrder) => {
      ResponseHelper.success(res, createdOrder);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

OrderController.request.createNewGuestCustomerOrder = function (req, res) {
  const reqError = Order.validate(req.body, {
    outlet: true,
    totalPrice: true,
    orderType: true,
    items: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.createNewGuestCustomerOrder(req.body).then(
    (createdOrder) => {
      ResponseHelper.success(res, createdOrder);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

OrderController.request.findOrderByOrderId = function (req, res) {
  const { orderId } = req.params;

  return Order.findOrderByOrderId(orderId).then((order) => {
    if (order) {
      return ResponseHelper.success(res, order);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_ORDER_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

OrderController.request.findOrdersById = function (req, res) {
  const orders = req.body;

  const ids = _.map(orders, (order) => order._id);

  return Order.findOrdersById(ids).then(
    (orders) => {
      return ResponseHelper.success(res, orders);
    },
    (error) => {
      return ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

OrderController.request.findOrdersByOrderId = function (req, res) {
  const orders = req.body;

  return Order.findOrdersById(orders).then(
    (orders) => {
      return ResponseHelper.success(res, orders);
    },
    (error) => {
      return ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

OrderController.request.findCompletedOrdersByCustomerId = function (req, res) {
  const { customerId } = req.params;
  return Order.findAllOrdersByCustomerId(customerId).then((allOrders) => {
    if (allOrders) {
      ResponseHelper.success(
        res,
        _.filter(
          allOrders,
          (order) =>
            order.orderStatus === Constants.COMPLETED ||
            order.orderStatus === Constants.CANCELLED ||
            order.orderStatus === Constants.REFUNDED
        )
      );
    } else {
      return ResponseHelper.success(res, []);
    }
  });
};

OrderController.request.findOngoingOrdersByCustomerId = function (req, res) {
  const { customerId } = req.params;
  return Order.findAllOrdersByCustomerId(customerId).then((allOrders) => {
    if (allOrders) {
      ResponseHelper.success(
        res,
        _.filter(
          allOrders,
          (order) =>
            order.orderStatus !== Constants.COMPLETED &&
            order.orderStatus !== Constants.CANCELLED &&
            order.orderStatus !== Constants.REFUNDED
        )
      );
    } else {
      return ResponseHelper.success(res, []);
    }
  });
};

OrderController.request.findAllHawkerCenters = function (req, res) {
  return Outlet.findAllHawkerCenters()
    .then((allOutlets) => {
      let hawkerCenterSummary = new Map();
      _.forEach(allOutlets, (outlet) => {
        if (!hawkerCenterSummary.get(outlet.hawkerCentreName)) {
          hawkerCenterSummary.set(outlet.hawkerCentreName, []);
        }
        hawkerCenterSummary.get(outlet.hawkerCentreName).push(outlet);
      });
      let allHawkerCenters = [];
      for (const [key, value] of hawkerCenterSummary) {
        allHawkerCenters.push(
          new HawkerCenter(
            key,
            value.length,
            _.uniqBy(
              _.flatMap(value, (outlet) => outlet.cuisineType),
              (e) => e
            ),
            value[0].outletAddress
          )
        );
      }
      return allHawkerCenters;
    })
    .then((allHawkerCenters) => {
      if (allHawkerCenters) {
        return ResponseHelper.success(res, allHawkerCenters);
      } else {
        return ResponseHelper.success(res, []);
      }
    });
};

OrderController.request.findAllHawkerOutletsByHawkerCentre = function (
  req,
  res
) {
  const { hawkerCentreName } = req.params;
  return Menu.findAllActiveMenus().then((allActiveMenus) => {
    if (allActiveMenus) {
      const hawkerStoreArr = [];
      _.forEach(allActiveMenus, (menu) => {
        if (menu.outlet && menu.outlet.hawkerCentreName === hawkerCentreName) {
          hawkerStoreArr.push(
            new HawkerStore(
              menu.outlet,
              _.filter(menu.foodBundles, (foodBundle) => foodBundle.isPromotion)
            )
          );
        }
      });
      return ResponseHelper.success(res, hawkerStoreArr);
    } else {
      return ResponseHelper.success(res, []);
    }
  });
};

OrderController.request.findCompletedOrdersByOutletId = function (req, res) {
  const { outletId } = req.params;
  return Order.findAllOrdersByOutletId(outletId).then((allOrders) => {
    if (allOrders) {
      ResponseHelper.success(
        res,
        _.filter(
          allOrders,
          (order) =>
            order.orderStatus === Constants.COMPLETED ||
            order.orderStatus === Constants.CANCELLED
        )
      );
    } else {
      return ResponseHelper.success(res, []);
    }
  });
};

OrderController.request.findAllInProgressOrdersByOutletId = function (
  req,
  res
) {
  const { outletId } = req.params;

  return Order.findAllInProgressOrdersByOutletId(outletId).then(
    (orders) => ResponseHelper.success(res, orders),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.updateOrderFoodItemStatusForMultipleOrders = function (
  req,
  res
) {
  const { foodItemId, foodItemStatus } = req.params;
  const orders = req.body;

  const ids = _.map(orders, (order) => order._id);

  return Order.updateOrderFoodItemStatusForMultipleOrders(
    ids,
    foodItemId,
    foodItemStatus
  )
    .then((res) => Order.findOrdersById(ids))
    .then(
      (updatedOrders) => {
        for (const order of updatedOrders) {
          emitMessage(Constants.UPDATE_ORDER_STATUS, order);
        }

        return ResponseHelper.success(res, updatedOrders);
      },
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OrderController.request.updateOrderBundleItemStatusForMultipleOrders =
  function (req, res) {
    const { foodBundleId, foodItemId, foodBundleStatus } = req.params;
    const orders = req.body;

    const ids = _.map(orders, (order) => order._id);
    return Order.updateOrderBundleItemStatusForMultipleOrders(
      ids,
      foodBundleId,
      foodItemId,
      foodBundleStatus
    )
      .then((res) => Order.findOrdersById(ids))
      .then(
        (updatedOrders) => {
          for (const order of updatedOrders) {
            emitMessage(Constants.UPDATE_ORDER_STATUS, order);
          }

          return ResponseHelper.success(res, updatedOrders);
        },
        (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
      );
  };

/**
UNPAID -> RECEIVED -> PREPARING -> READY -> COMPLETED
PAID -> RECEIVED -> PREPARING -> READY -> COMPLETED
CASH ORDER -> CANCELLED
DIGITAL ORDER -> REFUNDING -> REFUNDED
UNPAID -> PAID -> RECEIVED -> PREPARING -> READY -> PICKED_UP -> ON_THE_WAY -> DELIVERED -> COMPLETED
PAID -> RECEIVED -> PREPARING -> READY -> PICKED_UP -> ON_THE_WAY -> DELIVERED -> COMPLETED
*/
OrderController.request.updateOrderStatus = function (req, res) {
  const { newStatus } = req.params;
  const order = req.body;
  const reqError = Order.validate(order, {
    outlet: true,
    orderStatus: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  let stateError = false;

  switch (order.orderStatus) {
    case Constants.UNPAID:
      if (newStatus !== Constants.PAID) {
        stateError = true;
      }
      break;
    case Constants.RECEIVED:
      if (newStatus !== Constants.PREPARING) {
        stateError = true;
      }
      break;
    case Constants.PREPARING:
      if (newStatus !== Constants.READY && newStatus !== Constants.RECEIVED) {
        stateError = true;
      }
      break;
    case Constants.READY:
      if (
        newStatus !== Constants.COMPLETED &&
        newStatus !== Constants.PREPARING &&
        (order.orderType === Constants.DELIVERY && newStatus !== Constants.PICKED_UP)
      ) {
        stateError = true;
      }
      break;
    case Constants.PICKED_UP:
      if (
        newStatus !== Constants.ON_THE_WAY
      ) {
        stateError = true;
      }
      break;
    case Constants.ON_THE_WAY:
      if (
        newStatus !== Constants.DELIVERED
      ) {
        stateError = true;
      }
      break;
    case Constants.DELIVERED:
      if (
        newStatus !== Constants.COMPLETED
      ) {
        stateError = true;
      }
      break;
    default:
      stateError = true;
  }

  if (stateError) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_WRONG_NEXT_STATUS_FOR_ORDER),
      DEBUG_ENV
    );
  }

  return Order
    .updateOrderStatus(order, newStatus)
    .then(
      (updatedOrder) => {
        if (updatedOrder.orderStatus === Constants.COMPLETED
          && updatedOrder.paymentType === Constants.DIGITAL) {
          Wallet.debitCustomerWalletForOrder(order);
        }
        emitMessage(Constants.UPDATE_ORDER_STATUS, updatedOrder);
        return ResponseHelper.success(res, updatedOrder);
      },
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OrderController.request.cancelOrder = function (req, res) {
  const order = req.body;

  const reqError = Order.validate(order, {
    outlet: true,
    orderStatus: true,
    paymentType: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.updateOrderStatus(order, Constants.CANCELLED).then(
    (updatedOrder) => {
      emitMessage(Constants.CANCEL_ORDER, updatedOrder);
      return ResponseHelper.success(res, updatedOrder);
    },
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.updateOrderDetails = function (req, res) {
  const order = req.body;

  const reqError = Order.validate(order, {
    outlet: true,
    orderType: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.updateOrderDetails(order).then(
    (updatedOrder) => ResponseHelper.success(res, updatedOrder),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.cancelAllInProgressOrdersByOutletId = function (
  req,
  res
) {
  const { outletId } = req.params;

  return Order.findAllInProgressOrdersByOutletId(outletId)
    .then((inProgressOrders) => {
      const orderIdToCancel = [];

      for (let order of inProgressOrders) {
        order.orderStatus = Constants.CANCELLED;
        orderIdToCancel.push(order._id);
        //notify customer
        emitMessage(Constants.UNABLE_TO_FULFILL_ORDER, order);
      }

      return Order.markOrdersAsCancelled(orderIdToCancel);
    })
    .then(
      (success) => ResponseHelper.success(res),
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OrderController.request.retrieveCompletedOrdersByOutletId = function (
  req,
  res
) {
  const { outletId, startDate, endDate } = req.params;

  let startDateVal = moment(startDate);
  let endDateVal = moment(endDate);

  if (!startDate || !startDateVal.isValid() || !endDateVal.isValid()) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_INCORRECT_INPUT_OF_DATE),
      DEBUG_ENV
    );
  } else if (!endDate) {
    endDateVal = moment(startDate).add(1, "days");
  }

  return Order.findAllOrdersByOutletIdAndStatusAndTime(
    outletId,
    Constants.COMPLETED,
    startDateVal,
    endDateVal
  ).then(
    (success) => ResponseHelper.success(res, success),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

/**
 * LEADER BOARD
 */

OrderController.request.findAllHawkerCentresAndCuisineTypes = function (
  req,
  res
) {
  return Order.findAllHawkerCentresAndCuisineTypes().then(
    (retrievedHawkerCenters) =>
      ResponseHelper.success(res, retrievedHawkerCenters),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.findNumOfSalesForAllHawkers = function (req, res) {
  return Order.findNumOfSalesForAllHawkers().then(
    (retrievedNumOfSales) => ResponseHelper.success(res, retrievedNumOfSales),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.findNumOfSalesForAllHawkersForPastDays = function (
  req,
  res
) {
  const { numOfDays } = req.params;

  if (isNaN(numOfDays)) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_INCORRECT_INPUT_OF_NUMBER_OF_DAYS),
      DEBUG_ENV
    );
  }

  return Order.findNumOfSalesForAllHawkersForPastDays(numOfDays).then(
    (retrievedNumOfSales) => ResponseHelper.success(res, retrievedNumOfSales),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.findNumOfSalesForAllFoodItem = function (req, res) {
  let individualItem;
  let foodBundleItem;

  Order.findFoodItemsInIndividualOrderItems().then(
    (retrievedIndividualItem) => {
      individualItem = retrievedIndividualItem;
      Order.findFoodItemsInFoodBundleOrderItems().then(
        (retrievedFoodBundleItem) => {
          foodBundleItem = retrievedFoodBundleItem;
          for (var i = 0; i < foodBundleItem.length; i++) {
            if (
              individualItem.filter(
                (e) => String(e._id.foodItemId) === String(foodBundleItem[i]._id)
              ).length > 0
            ) {
              for (var j = 0; j < individualItem.length; j++) {
                if (
                  String(individualItem[j]._id.foodItemId) ===
                  String(foodBundleItem[i]._id)
                ) {
                  individualItem[j].numOfSales += foodBundleItem[i].numOfSales;
                  break;
                }
              }
            } else {
              individualItem.push(foodBundleItem[i]);
            }
          }

          individualItem.sort((a, b) => b.numOfSales - a.numOfSales);

          ResponseHelper.success(res, individualItem);
        },
        (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
      );
    },
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.findNumOfSalesForAllFoodItemForPastDays = function (
  req,
  res
) {
  const { numOfDays } = req.params;

  let individualItem;
  let foodBundleItem;

  if (isNaN(numOfDays)) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_INCORRECT_INPUT_OF_NUMBER_OF_DAYS),
      DEBUG_ENV
    );
  }

  Order.findFoodItemsInIndividualOrderItemsForPastDays(numOfDays).then(
    (retrievedIndividualItem) => {
      individualItem = retrievedIndividualItem;

      Order.findFoodItemsInFoodBundleOrderItemsForPastDays(numOfDays).then(
        (retrievedFoodBundleItem) => {
          foodBundleItem = retrievedFoodBundleItem;

          for (var i = 0; i < foodBundleItem.length; i++) {
            if (
              individualItem.filter(
                (e) => String(e._id.foodItemId) === String(foodBundleItem[i]._id)
              ).length > 0
            ) {
              for (var j = 0; j < individualItem.length; j++) {
                if (
                  String(individualItem[j]._id.foodItemId) ===
                  String(foodBundleItem[i]._id)
                ) {
                  individualItem[j].numOfSales += foodBundleItem[i].numOfSales;
                  break;
                }
              }
            } else {
              individualItem.push(foodBundleItem[i]);
            }
          }

          individualItem.sort((a, b) => b.numOfSales - a.numOfSales);

          ResponseHelper.success(res, individualItem);
        },
        (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
      );
    },
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

/**
 * DELIVERY
 */
function groupOrdersByHawkerCenterName(deliveryOrders) {
  const hawkerCenterSummary = new Map();
  const hawkerCenterCuisine = new Map();

  _.forEach(deliveryOrders, (order) => {
    if (!hawkerCenterSummary.get(order.outlet.hawkerCentreName)) {
      hawkerCenterSummary.set(order.outlet.hawkerCentreName, []);
      hawkerCenterCuisine.set(order.outlet.hawkerCentreName, new Set());
    }
    hawkerCenterSummary.get(order.outlet.hawkerCentreName).push(order);
    order.outlet.cuisineType.forEach((cuisine) =>
      hawkerCenterCuisine.get(order.outlet.hawkerCentreName).add(cuisine)
    );
  });

  let allHawkerCenters = [];

  for (const [key, value] of hawkerCenterSummary) {
    allHawkerCenters.push(
      new DeliveryHawkerCenter(key, value, hawkerCenterCuisine.get(key))
    );
  }
  return allHawkerCenters;
}

OrderController.request.findAllAssociatedOrdersByCustomerId = function (req, res) {
	const { customerId } = req.params;

	return Order.findAllAssociatedOrdersByCustomerId(customerId).then(orders => {
		if (orders) {
			return ResponseHelper.success(res, orders);
		} else {
			return ResponseHelper.success(res, []);
		}
	})
}

OrderController.request.findAllDeliveryOrders = function (req, res) {
  const { customerId } = req.params;

  return Order
    .findAllDeliveryOrders(customerId)
    .then(deliveryOrders => {
      return groupOrdersByHawkerCenterName(deliveryOrders);
    })
    .then((allHawkerCenters) => {
      if (allHawkerCenters) {
        return ResponseHelper.success(res, allHawkerCenters);
      } else {
        return ResponseHelper.success(res, []);
      }
    })
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

OrderController.request.findAllDeliveryOrdersByHawkerCenter = function (req, res) {
  const { customerId } = req.params;
  const { hawkerCenterName } = req.query;

  return Order
    .findAllDeliveryOrders(customerId)
    .then(deliveryOrders => {
      return groupOrdersByHawkerCenterName(deliveryOrders);
    })
    .then((hawkerCenters) => {
      if (hawkerCenters) {
        return ResponseHelper.success(
          res,
          _.filter(hawkerCenters, hawkerCenter => hawkerCenter.hawkerCenterName === hawkerCenterName)[0].orders
        );
      } else {
        return ResponseHelper.success(res, []);
      }
    })
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

OrderController.request.findAllCompletedDeliveryOrdersByHawkerCenter = function (req, res) {
  const { customerId } = req.params;
  const { hawkerCenterName } = req.query;

  return Order
    .findAllCompletedDeliveryOrders()
    .then(deliveryOrders => {
      return groupOrdersByHawkerCenterName(deliveryOrders);
    })
    .then((hawkerCenters) => {
      if (hawkerCenters) {
        return ResponseHelper.success(
          res,
          _.filter(hawkerCenters, hawkerCenter => hawkerCenter.hawkerCenterName === hawkerCenterName)[0].orders
        );
      } else {
        return ResponseHelper.success(res, []);
      }
    })
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

OrderController.request.updateDelivererForOrder = function (req, res) {
  const { orderId } = req.params;
  let { delivererId } = req.body;

  if (!delivererId) {
    delivererId = undefined;
  }

  return Order
    .updateDelivererForOrder(orderId, delivererId)
    .then(updatedOrder => {
      emitMessage(Constants.DELIVERY, updatedOrder);
      return ResponseHelper.success(res, updatedOrder);
    })
    .catch((error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
}

OrderController.request.findOngoingDeliveryOrdersByDelivererId = function (req, res) {
  const { delivererId } = req.params;
  return Order.findAllDeliveryOrdersByDelivererId(delivererId).then((deliveryOrders) => {
    if (deliveryOrders) {
      ResponseHelper.success(
        res,
        _.filter(
          deliveryOrders,
          (order) =>
            order.orderStatus !== Constants.COMPLETED &&
            order.orderStatus !== Constants.CANCELLED &&
            order.orderStatus !== Constants.REFUNDED
        )
      );
    } else {
      return ResponseHelper.success(res, []);
    }
  })
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));

};

OrderController.request.findCompletedDeliveryOrdersByDelivererId = function (req, res) {
  const { delivererId } = req.params;
  return Order
    .findAllDeliveryOrdersByDelivererId(delivererId)
    .then((deliveryOrders) => {
      if (deliveryOrders) {
        ResponseHelper.success(
          res,
          _.filter(
            deliveryOrders,
            (order) =>
              order.orderStatus === Constants.COMPLETED ||
              order.orderStatus === Constants.CANCELLED ||
              order.orderStatus === Constants.REFUNDED
          )
        );
      } else {
        return ResponseHelper.success(res, []);
      }
    })
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

OrderController.request.updateDeliveryFeeForOrder = function (req, res) {
  const { orderId } = req.params;
  const { newDeliveryFee } = req.body;

  return Order
    .updateDeliveryFeeForOrder(orderId, newDeliveryFee)
    .then(updatedOrder => {
      emitMessage(Constants.DELIVERY, updatedOrder);
      return ResponseHelper.success(res, updatedOrder);
    })
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

OrderController.request.changeDeliveryToTakeaway = function (req, res) {
  const order = req.body;

  const reqError = Order.validate(order, {
    orderType: true
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.updateOrderDetails(order).then(
    (updatedOrder) => {
      emitMessage(Constants.DELIVERY, updatedOrder);
      ResponseHelper.success(res, updatedOrder)
    },
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

/**
 * HAWKER ANALYTICS
 */
OrderController.request.generateHawkerAnalytics = function (req, res) {
  const { outletId } = req.params;
  const { startDate, endDate, interval } = req.body;

  let startDateM = moment(startDate);
  let endDateM = moment(endDate);
  let intervalTitle;
  let formatDate;
  switch (interval) {
    case "days":
      intervalTitle = "for the Month";
      formatDate = "DD/MM";
      break;
    case "months":
      intervalTitle = "for the Year";
      formatDate = "MM/YYYY";
      break;
    case "hours":
      intervalTitle = "for the Day";
      formatDate = "h:mm aaa";
      break;
    default:
      intervalTitle = "From";
      break;
  }

  let tempDate = moment(startDateM);

  let data = {
    sales: {
      name: `Sales ${intervalTitle} : ${startDateM.format(
        "DD/MM/YYYY"
      )}-${endDateM.format("DD/MM/YYYY")}`,
      totalNumOfSales: 0,
      series: [],
    },
  };

  while (tempDate.startOf("day").isSameOrBefore(endDateM.startOf("day"))) {
    data.sales.series.push({
      name: tempDate.format(formatDate),
      value: 0,
    });
    tempDate.add(1, interval);
  }

  if (interval === "days") {
    endDateM = endDateM.subtract(1, "days");
  }

  return Order.findAllOrdersByOutletIdAndStatusAndTime(
    outletId,
    startDateM.toDate(),
    endDateM.toDate()
  )
    .then((orders) => {
      for (let o of orders) {
        data.sales.series.filter(
          (x) =>
            moment(o.completedTime).format(formatDate).toString() === x.name
        )[0].value += o.totalPrice;
      }
      return ResponseHelper.success(res, data);
    })
    .catch((error) =>
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OrderController.request.generateHawkerAnalyticsForOutlet = function (req, res) {
  const { outletId } = req.params;
  const { startDate, endDate, interval } = req.body;
  let startDateM = moment(startDate);
  let endDateM = moment(endDate);

  let formatDate;
  let intervalCode;
  let intervalTitle;
  switch (interval) {
    case "days":
      intervalTitle = "for the day";
      intervalCode = "day";
      formatDate = "DD/MM";
      break;
    case "weeks":
      intervalTitle = "for the week";
      intervalCode = "week";
      formatDate = "DD/MM";
      break;
    case "months":
      intervalTitle = "for the month";
      intervalCode = "month";
      formatDate = "MM/YYYY";
      break;
    case "years":
      intervalTitle = "for the year";
      intervalCode = "year";
      formatDate = "YYYY";
      break;
    default:
      intervalTitle = "From";
      break;
  }

  let tempDate = moment(startDateM);
  let dateRangeIntervals = [];
  while (
    tempDate
      .startOf(intervalCode)
      .isSameOrBefore(endDateM.startOf(intervalCode))
  ) {
    dateRangeIntervals.push(tempDate.format(formatDate));
    tempDate.add(1, interval);
  }

  if (interval === "months") {
    endDateM = endDateM.endOf("month");
  } else if (interval === "days") {
    endDateM = endDateM.endOf("day");
  }

  const callForEarningsAndSales = () =>
    Order.findAllEarningsByOutletIdAndTime(
      outletId,
      moment
        .utc(startDateM.utcOffset("-8").format("YYYY-MM-DD HH:mm"))
        .toDate(),
      moment.utc(endDateM.utcOffset("-8").format("YYYY-MM-DD HH:mm")).toDate()
    ).then((retrievedCollatedEarnings) => {
      let data = {
        sales: {
          name: ``,
          totalEarnings: 0,
          series: dateRangeIntervals.map((dateInterval) => ({
            name: dateInterval,
            value: 0,
          })),
        },
        noOfSales: {
          name: ``,
          totalOrders: 0,
          series: dateRangeIntervals.map((dateInterval) => ({
            name: dateInterval,
            value: 0,
          })),
        },
      };
      for (const res of retrievedCollatedEarnings) {
        data.sales.totalEarnings += res.earnings;
        data.noOfSales.totalOrders += 1;
        const salesSeries = data.sales.series.filter((x) => {
          const formattedDate = moment.utc(moment(res._id)).local().format(formatDate).toString();
          const result = formattedDate === x.name
          return result;
        });
        salesSeries[0].value += res.earnings;
        const noOfSalesSeries = data.noOfSales.series.filter((x) => {
          const formattedDate = moment.utc(moment(res._id)).local().format(formatDate).toString();
          const result = formattedDate === x.name
          return result;
        });
        noOfSalesSeries[0].value += 1;
      }
      return data;
    });

  const callForFoodItems = () => {
    let resultArr = [];
    return Order.findAllIndividualFoodItemsSoldByOutletIdAndTime(
      outletId,
      moment.utc(startDateM.local().format("YYYY-MM-DD HH:mm")).toDate(),
      moment.utc(endDateM.local().format("YYYY-MM-DD HH:mm")).toDate()
    ).then((retrievedIndividualItem) => {
      resultArr = resultArr.concat(retrievedIndividualItem);
      return Order.findAllFoodBundleFoodItemsSoldByOutletIdAndTime(
        outletId,
        moment
          .utc(startDateM.local().format("YYYY-MM-DD HH:mm"))
          .toDate(),
        moment.utc(endDateM.local().format("YYYY-MM-DD HH:mm")).toDate()
      ).then((retrievedFoodBundleFoodItem) => {
        resultArr = resultArr.concat(retrievedFoodBundleFoodItem);
        resultArr = resultArr.reduce((arr, item) => {
          let newArr = arr;
          const isFound = arr.find((arrItem) => arrItem._id === item._id);
          if (isFound) {
            newArr = arr.map((arrItem) => {
              let newQty = arrItem.qty;
              if (arrItem._id === item._id) {
                newQty += item.qty;
              }
              return { ...arrItem, qty: newQty };
            });
          } else {
            newArr.push(item);
          }
          return newArr;
        }, []);

        const data = {
          name: "",
          series: resultArr.map((el) => ({
            name: el._id,
            value: el.qty,
          })),
        };
        return { foodItems: data };
      });
    });
  };

  const callForImmediateOrdersPerformance = () => {
    return Order.findAllImmediateOrdersByOutletIdAndTime(
      outletId,
      moment
        .utc(startDateM.local().format("YYYY-MM-DD HH:mm"))
        .toDate(),
      moment.utc(endDateM.local().format("YYYY-MM-DD HH:mm")).toDate()
    ).then((retrievedResults) => {
      const formattedSeries = dateRangeIntervals.map((dateInterval) => {
        const diffArr = retrievedResults
          .filter(
            (order) =>
              moment(order.orderCreationTime).format(formatDate) ===
              dateInterval
          )
          .map((order) => {
            const minsDiff = moment(order.completedTime).diff(
              moment(order.orderCreationTime),
              "minutes"
            );
            return minsDiff;
          });

        const calculatedAverage = _.meanBy(diffArr, (x) => x);
        const finalAverage = Number.isNaN(calculatedAverage)
          ? 0
          : calculatedAverage;
        return {
          name: dateInterval,
          value: finalAverage,
        };
      });
      return {
        immediateOrders: {
          name: "",
          series: formattedSeries,
        },
      };
    });
  };

  const callForDinerType = () => {
    return Order.findAllDinerTypeByOutletIdAndTime(
      outletId,
      moment
        .utc(startDateM.local().format("YYYY-MM-DD HH:mm"))
        .toDate(),
      moment.utc(endDateM.local().format("YYYY-MM-DD HH:mm")).toDate()
    ).then((retrievedResults) => {
      const formattedSeries = retrievedResults.map((el) => ({
        name: el._id,
        value: el.value,
      }));
      return {
        dinerTypes: {
          name: "",
          series: formattedSeries,
        },
      };
    });
  };

  const callForPaymentType = () => {
    return Order.findAllPaymentTypeByOutletIdAndTime(
      outletId,
      moment
        .utc(startDateM.local().format("YYYY-MM-DD HH:mm"))
        .toDate(),
      moment.utc(endDateM.local().format("YYYY-MM-DD HH:mm")).toDate()
    ).then((retrievedResults) => {
      const formattedSeries = retrievedResults.map((el) => ({
        name: el._id,
        value: el.value,
      }));
      return {
        paymentTypes: {
          name: "",
          series: formattedSeries,
        },
      };
    });
  };

  const callForCashbackType = () => {
    return Order.findAllCashbackOrdersByOutletIdAndTime(
      outletId,
      moment
        .utc(startDateM.local().format("YYYY-MM-DD HH:mm"))
        .toDate(),
      moment.utc(endDateM.local().format("YYYY-MM-DD HH:mm")).toDate()
    ).then((retrievedResults) => {
      const cashbacks = retrievedResults.map(el => {
        const cb = el.creditedCashback / el.totalPrice;
        const cbRound = Math.round(cb * 100);
        return cbRound;
      })
      cashbacks.sort((a, b) => a - b);
      let cashbackString = cashbacks;
      cashbackString = cashbacks.map(cb => {
        cb = cb + '%';
        return cb;
      })
      const formattedSeries = cashbackString.reduce((arr, item) => {
        let newArr = arr;
        const isFound = arr.find((arrItem) => arrItem.name === item);
        if (isFound) {
          newArr = arr.map((arrItem) => {
            let newValue = arrItem.value;
            if (arrItem.name === item) {
              newValue += 1;
            }
            return { ...arrItem, value: newValue };
          });
        } else {
          newArr.push({ name: item, value: 1 });
        }
        return newArr;
      }, []);
      return {
        cashbackTypes: {
          name: "",
          series: formattedSeries,
        },
      };
    });
  };

  return Promise.all([
    callForEarningsAndSales(),
    callForFoodItems(),
    callForImmediateOrdersPerformance(),
    callForDinerType(),
    callForPaymentType(),
    callForCashbackType()
  ])
    .then((results) => {
      const flattenedResults = results.reduce(
        (red, item) => ({ ...red, ...item }),
        {}
      );
      return ResponseHelper.success(res, flattenedResults);
    })
    .catch((error) =>
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OrderController.request.retrieveHawkerEarningsByOutletIdForSpecificPeriod = function (req, res) {
  const { outletId } = req.params
  const { startDate, endDate } = req.body;

  let startDateM = moment(startDate);
  let endDateM = moment(endDate);

  return Order.retrieveHawkerEarningsByOutletIdForSpecificPeriod(outletId, startDateM.toDate(), endDateM.toDate()).then(
    (retrievedEarnings) => ResponseHelper.success(res, retrievedEarnings),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

OrderController.request.findNumOfSalesByOutletIdForSpecificPeriod = function (req, res) {
  const { outletId } = req.params;
  const { startDate, endDate } = req.body;

  return Order.findNumOfSalesByOutletIdForSpecificPeriod(outletId, startDate, endDate).then(
    (retrievedSales) => ResponseHelper.success(res, { sum: retrievedSales.length }),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

OrderController.request.retrieveComparativeSalesAnalytics = function (req, res) {
	const { outletId } = req.params;
	const { startDate, endDate } = req.body;

	let startDateM = moment(startDate);
	let endDateM = moment(endDate);
	let formatDate = "DD/MM";

	let tempDate = moment(startDateM);

	let data = {
		sales: {
			series: [],
		},
	};

	while (tempDate.startOf("day").isSameOrBefore(endDateM.startOf("day"))) {
		data.sales.series.push({
			name: tempDate.format(formatDate),
			value: 0,
		});
		tempDate.add(1, 'days');
	}

	return Order.findAllCompletedSalesByOutletIdByStartAndEndDate(
		outletId,
		Constants.COMPLETED,
		startDateM.toDate(),
		endDateM.toDate()
	)
		.then((orders) => {
			for (let o of orders) {
				data.sales.series.filter(
					(x) =>
						moment(o.orderCreationTime).format(formatDate).toString() === x.name
				)[0].value += 1;
			}
			return ResponseHelper.success(res, data);
		})
		.catch((error) =>
			ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
		);
};

export default OrderController;
