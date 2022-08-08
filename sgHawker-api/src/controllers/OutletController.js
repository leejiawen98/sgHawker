import { ResponseHelper } from "helpers";
import { ClientError, Constants } from "common";
import { Outlet, QueueSetting } from "models";
import User from "../models/User";

const DEBUG_ENV = "OutletController";

const OutletController = {
  request: {},
};

OutletController.request.createNewOutlet = function (req, res) {
  const { id } = req.params;

  const reqError = Outlet.validate(req.body, {
    outletName: true,
    outletAddress: true,
    hawkerCentreName: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  Outlet
    .createOutlet(req.body, id)
    .then(createdOutlet => QueueSetting.createQueueSettingForOutlet(createdOutlet))
    .then(createdOutlet => ResponseHelper.success(res, createdOutlet))
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

OutletController.request.deleteOutlet = function (req, res) {
  const { outletId } = req.params;

  return Outlet.findById(outletId).then(outlet => {
    if (outlet) {
      return Outlet.deleteOutlet(outletId);
    } else {
      return ResponseHelper.error(res, new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND), DEBUG_ENV);
    }
  }).then(deletedOutlet => {
    return ResponseHelper.success(res, deletedOutlet);
  }).catch(error => ResponseHelper.error(
    res,
    new ClientError(error),
    DEBUG_ENV
  ));
};

OutletController.request.findOutletById = function (req, res) {
  const { outletId } = req.params;

  return Outlet
    .findOutletById(outletId)
    .then((outlet) => {
      if (outlet) {
        return ResponseHelper.success(res, outlet);
      } else {
        return ResponseHelper.error(
          res,
          new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND),
          DEBUG_ENV
        );
      }
    });
};

OutletController.request.findOutletsByHawkerId = function (req, res) {
  const { hawkerId } = req.params;

  return User.findById(hawkerId).then(hawker => {
    if (hawker) {
      return Outlet.findOutletsByHawkerId(hawkerId)
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_INVALID_HAWKER_ID),
        DEBUG_ENV
      );
    }
  }).then(outlets => {
    return ResponseHelper.success(res, outlets);
  }).catch(error => ResponseHelper.error(
    res,
    new ClientError(error),
    DEBUG_ENV
  ));
};

OutletController.request.findMasterOutletsByHawkerId = function (req, res) {
  const { hawkerId } = req.params;

  return Outlet.findOutletsByHawkerId(hawkerId).then((outlets) => {
    const masterOutlet = outlets.find(x => x.isMaster);
    if (masterOutlet) {
      return ResponseHelper.success(res, masterOutlet);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_INVALID_HAWKER_ID),
        DEBUG_ENV
      );
    }
  });
};

OutletController.request.findAllOutlets = function (req, res) {
  return Outlet
    .findAllActiveOutlets()
    .then((outlets) => ResponseHelper.success(res, outlets));
};

OutletController.request.updateOutlet = function (req, res) {
  const { outletId } = req.params;

  const reqError = Outlet.validate(req.body, {
    outletName: true,
    outletAddress: true,
    hawkerCentreName: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Outlet
    .updateOutlet(outletId, req.body)
    .then(
      (outlet) => ResponseHelper.success(res, outlet),
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OutletController.request.updateOutletCashback = function (req, res) {
  const { outletId } = req.params;
  const { cashbackRate, cashbackIsActive } = req.body;

  if (cashbackRate) {
    const reqError = Outlet.validate(req.body, {
      cashbackRate: true,
    });

    if (reqError) {
      return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
    }
  }

  return Outlet
    .updateOutletCashback(outletId, cashbackRate, cashbackIsActive)
    .then(
      (outlet) => ResponseHelper.success(res, outlet),
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
};

/**
QUEUE SETTING
*/

OutletController.request.findQueueSettingByOutletId = function (req, res) {
  const { outletId } = req.params;

  return Outlet.findById(outletId).then(outlet => {
    if (outlet) {
      return QueueSetting.findQueueSettingByOutletId(outletId)
    } else {
      return ResponseHelper.error(res, new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND), DEBUG_ENV)
    }
  }).then(queueSettingArr => {
    ResponseHelper.success(res, queueSettingArr[0]);
  }).catch(error => ResponseHelper.error(
    res,
    new ClientError(error),
    DEBUG_ENV
  ));
};

OutletController.request.updateQueueSetting = function (req, res) {
  const reqError = QueueSetting.validate(req.body, {
    defaultQueuePreference: true,
    outlet: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }
  return QueueSetting
    .updateQueueSetting(req.body)
    .then(
      queueSetting => ResponseHelper.success(res, queueSetting),
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
};

/**
HAWKER ANALYTICS: GOALS
*/

OutletController.request.addGoal = function (req, res) {
  const { outletId } = req.params;
  const goal = req.body;

  return Outlet.findById(outletId).then(outlet => {
    if (outlet) {
      return Outlet.addGoal(outletId, goal);
    } else {
      return ResponseHelper.error(res, new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND), DEBUG_ENV)
    }
  }).then(outlet => {
    ResponseHelper.success(res, outlet);
  }).catch(error => ResponseHelper.error(
    res,
    new ClientError(error),
    DEBUG_ENV
  ));
}

OutletController.request.updateGoal = function (req, res) {
  const { outletId } = req.params;
  const goal = req.body;

  return Outlet.findById(outletId).then(outlet => {
    if (outlet) {
      return Outlet.updateGoal(outletId, goal)
    } else {
      return ResponseHelper.error(res, new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND), DEBUG_ENV)
    }
  }).then(outlet => {
    ResponseHelper.success(res, outlet);
  }).catch(error => ResponseHelper.error(
    res,
    new ClientError(error),
    DEBUG_ENV
  ));
}

OutletController.request.synchronizeCashbackAcrossOutlets = function (req, res) {
  const { outletIdArray, cashbackIsActive, cashbackRate } = req.body;
  const reqError = Outlet.validate(req.body, {
    cashbackRate: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }
  return Outlet
    .synchronizeSetCashback(outletIdArray, cashbackIsActive, cashbackRate)
    .then(
      outlets => ResponseHelper.success(res, outlets),
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
};
export default OutletController;
