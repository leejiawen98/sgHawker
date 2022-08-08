import _ from "lodash";
import { ClientError, Constants } from "common";
import { ResponseHelper } from "helpers";
import { Menu } from "models";

const DEBUG_ENV = "MenuController";

const MenuController = {
  request: {},
};

/**
 * Menu
 */
MenuController.request.createNewMenu = function (req, res) {
  const reqError = Menu.validate(req.body, {
    menuName: true,
    outlet: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  Menu.createNewMenu(req.body).then(
    (createdMenu) => {
      ResponseHelper.success(res, createdMenu);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

MenuController.request.findMenusByOutletId = function (req, res) {
  const { outletId } = req.params;

  return Menu.findMenusByOutletId(outletId).then((menus) => {
    if (menus) {
      return ResponseHelper.success(res, menus);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

MenuController.request.findActiveMenuByOutletId = function (req, res) {
  const { outletId } = req.params;

  return Menu.findActiveMenuByOutletId(outletId).then((menus) => {
    if (menus && menus[0]) {
      return ResponseHelper.success(res, menus[0]);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

MenuController.request.deleteMenu = function (req, res) {
  const { menuId } = req.params;

  return Menu
    .findById(menuId)
    .then(menu => {
      if (menu) {
        return Menu.deleteMenu(menuId)
      } else {
        return ResponseHelper.error(
          res,
          new ClientError(Constants.ERROR_MENU_DOES_NOT_EXIST),
          DEBUG_ENV
        );
      }
    })
    .then((deletedMenu) => {
      return ResponseHelper.success(res, deletedMenu);
    })
    .catch(error => ResponseHelper.error(
      res,
      new ClientError(error),
      DEBUG_ENV
    ));
};

MenuController.request.findMenuById = function (req, res) {
  const { menuId } = req.params;

  return Menu.findMenuById(menuId).then((menu) => {
    if (menu) {
      return ResponseHelper.success(res, menu);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_MENU_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

MenuController.request.findAllMenus = function (req, res) {
  Menu.findAllMenus().then((menus) => ResponseHelper.success(res, menus));
};

MenuController.request.updateMenu = function (req, res) {
  const { menuId } = req.params;

  const reqError = Menu.validate(req.body, {
    menuName: true,
    activeMenu: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Menu.updateMenu(menuId, req.body).then(
    (menu) => ResponseHelper.success(res, menu),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

MenuController.request.synchronizeMenu = function (req, res) {
  const { menuId } = req.params;
  const { menu, outletIdArr } = req.body;

  const reqError = Menu.validate(menu, {
    menuName: true,
    activeMenu: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Menu.synchronizeMenu(menu, outletIdArr).then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

MenuController.request.synchronizeMenuDelete = function (req, res) {
  const { menuToSync, outletIdArr } = req.body;

  return Menu.synchronizeMenuDelete(menuToSync, outletIdArr).then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

MenuController.request.synchronizeMultipleMenus = function (req, res) {
  const { menuArr, outletIdArr } = req.body;

  return Menu.synchronizeMultipleMenus(menuArr, outletIdArr).then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

MenuController.request.synchronizeMenuCategories = function (req, res) {
  const { menuArr, menuCategoryArr, outletIdArr } = req.body;

  return Menu.synchronizeMenuCategories(menuArr, menuCategoryArr, outletIdArr).then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  )
}

MenuController.request.synchronizeMenuCategoryUpdate = function (req, res) {
  const { menuIdArr, menuCategory, outletIdArr } = req.body;
  
  return Menu.synchronizeMenuCategoryUpdate(menuIdArr, menuCategory, outletIdArr)
  .then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  )
}

MenuController.request.synchroniseMenuCategoryDelete = function (req, res) {
  const { menuCategoryName } = req.params;
  const { menuIdArr } = req.body;

  return Menu.synchroniseMenuCategoryDelete(menuCategoryName, menuIdArr)
  .then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  )
}

MenuController.request.synchronizeFoodItemsAcrossMenus = function (req, res) {
  const { menuIdArr, foodItemArr, outletIdArr } = req.body;

  return Menu.synchronizeFoodItemsAcrossMenus(menuIdArr, foodItemArr, outletIdArr)
    .then(
      (response) => ResponseHelper.success(res, response),
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
}

MenuController.request.synchroniseFoodItemDeleteAcrossMenus = function (req, res) {
  const { foodItemName } = req.params;
  const { menuIdArr, outletIdArr } = req.body;
  
  return Menu.synchroniseFoodItemDeleteAcrossMenus(foodItemName, menuIdArr, outletIdArr)
  .then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  )
}

MenuController.request.synchronizeFoodBundlesAcrossMenus = function (req, res) {
  const { menuIdArr, foodBundleArr, outletIdArr } = req.body;

  return Menu.synchronizeFoodBundlesAcrossMenus(menuIdArr, foodBundleArr, outletIdArr)
  .then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  )
}

MenuController.request.synchronizeFoodBundleUpdate = function (req, res) {
  const { menuIdArr, foodBundle, outletIdArr } = req.body;
  
  return Menu.synchronizeFoodBundleUpdateAcrossMenus(menuIdArr, foodBundle, outletIdArr)
  .then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  )
}

MenuController.request.synchroniseFoodBundleDelete = function (req, res) {
  const { foodBundleName } = req.params;
  const { menuIdArr } = req.body;

  return Menu.synchroniseFoodBundleDelete(foodBundleName, menuIdArr)
  .then(
    (response) => ResponseHelper.success(res, response),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  )
}

export default MenuController;
