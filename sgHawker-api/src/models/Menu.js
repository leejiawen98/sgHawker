import mongoose, { Schema } from "mongoose";
import _ from "lodash";
const Outlet = require("./Outlet");

const Menu = new Schema({
  menuName: {
    type: String,
    required: true,
    trim: true,
  },
  activeMenu: {
    type: Boolean,
    required: true,
    default: false,
  },
  foodItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },
  ],
  menuCategories: [
    {
      categoryName: {
        type: String,
        required: true,
        trim: true,
      },
      foodItems: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem",
        },
      ],
    },
  ],
  foodBundles: [
    {
      bundleImgSrc: {
        type: String,
      },
      bundleName: {
        type: String,
        required: true,
        trim: true,
      },
      bundlePrice: {
        type: Number,
        required: true,
      },
      isPromotion: {
        type: Boolean,
        required: true,
        default: false,
      },
      foodItems: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem",
          required: true,
        },
      ],
    },
  ],
  outlet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Outlet",
    required: true,
  },
});

Menu.statics.validate = function (menu, fields) {
  if (fields.menuName) {
    if (!menu.menuName) {
      return Constants.ERROR_MENU_NAME_REQUIRED;
    }
  }
  if (fields.outlet) {
    if (!menu.outlet) {
      return Constants.ERROR_OUTLET_REQUIRED;
    }
  }
  if (fields.foodItems) {
    if (!menu.foodItems || (menu.foodItems && menu.foodItems.length === 0)) {
      return Constants.ERROR_MENU_FOOD_ITEM_REQUIRED;
    }
  }
  if (fields.itemCategories) {
    if (
      !menu.menuCategories ||
      (menu.menuCategories && menu.menuCategories.length === 0)
    ) {
      return Constants.ERROR_MENU_CATEGORIES_REQUIRED;
    }
    _.forEach(menu.menuCategories, (category) => {
      if (!category.categoryName) {
        return Constants.ERROR_MENU_CATEGORY_NAME_REQUIRED;
      }
      if (
        !category.foodItems ||
        (category.foodItems && category.foodItems.length === 0)
      ) {
        return Constants.ERROR_MENU_CATEGORY_FOOD_ITEMS_REQUIRED;
      }
    });
  }
  if (fields.foodBundles) {
    if (
      !menu.foodBundles ||
      (menu.foodBundles && menu.foodBundles.length === 0)
    ) {
      return Constants.ERROR_MENU_BUNDLE_REQUIRED;
    }
    _.forEach(menu.foodBundles, (foodBundle) => {
      if (!foodBundle.bundleName) {
        return Constants.ERROR_MENU_BUNDLE_NAME_REQUIRED;
      }
      if (!foodBundle.bundlePrice) {
        return Constants.ERROR_MENU_BUNDLE_PRICE_REQUIRED;
      }
      if (parseFloat(foodBundle.bundlePrice) < Constants.ITEM_MIN_PRICE) {
        return Constants.ERROR_NEGATIVE_BUNDLE_PRICE;
      }
      if (parseFloat(foodBundle.bundlePrice) > Constants.ITEM_MAX_PRICE) {
        return Constants.ERROR_BUNDLE_PRICE_EXCEED_LIMIT;
      }
      if (
        !foodBundle.foodItems ||
        (foodBundle.foodItems && foodBundle.foodItems.length === 0)
      ) {
        return Constants.ERROR_MENU_BUNDLE_FOOD_ITEMS_REQUIRED;
      }
    });
  }
  return null;
};

/**
 *
 * @param {*} menu
 * @param {*} foodItemsIdArr
 * @returns created menu
 */
Menu.statics.createNewMenu = function (menu) {
  return Promise.resolve()
    .then(() => this.create(menu))
    .then((newMenu) => {
      const foodItemsIdArr = [];
      if (newMenu.foodItems !== undefined || newMenu.foodItems.length !== 0) {
        for (const item of newMenu.foodItems) {
          foodItemsIdArr.push(item._id);
        }
      }
      const FoodItem = require("./FoodItem");
      const Outlet = require("./Outlet");

      const updateOptions = {
        $push: { menus: newMenu._id },
      };

      const options = {
        multi: true,
      };

      FoodItem.updateMany(
        {
          _id: {
            $in: foodItemsIdArr,
          },
        },
        updateOptions,
        options
      ).exec();

      Outlet.findByIdAndUpdate(menu.outlet._id, updateOptions).exec();
      return newMenu;
    });
};

/**
 *
 * @param {*} outletId
 * @returns menus
 */
Menu.statics.findMenusByOutletId = function (outletId) {
  const filterOptions = {
    outlet: mongoose.Types.ObjectId(outletId),
  };
  return this
  .find(filterOptions)
  .populate("foodItems")
  .populate("outlet")
  .populate("menuCategories.foodItems")
  .populate("foodBundles.foodItems")
  .exec();
};

Menu.statics.findActiveMenuByOutletId = function (outletId) {
  const filterOptions = {
    activeMenu: true,
    outlet: mongoose.Types.ObjectId(outletId),
  };
  return this.find(filterOptions)
    .populate("foodItems")
    .populate("outlet")
    .populate("menuCategories.foodItems")
    .populate("foodBundles.foodItems")
    .exec();
};

/**
 *
 * @param {*} menuId
 * @returns deleted menu
 *
 */
Menu.statics.deleteMenu = function (menuId) {
  return Promise.resolve()
    .then(() => this.findByIdAndDelete(menuId))
    .then((deletedMenu) => {
      const update = {
        $pull: { menus: menuId },
      };

      const FoodItem = require("./FoodItem");
      const Outlet = require("./Outlet");

      FoodItem.updateMany({ menus: menuId }, update).exec();
      Outlet.findOneAndUpdate({ menus: menuId }, update).exec();

      return deletedMenu;
    });
};

/**
 *
 * @param {*} menuId
 * @returns menu
 *
 */
Menu.statics.findMenuById = function (menuId) {
  return this.findById(menuId)
    .populate("foodItems")
    .populate("outlet")
    .populate("menuCategories.foodItems")
    .populate("foodBundles.foodItems")
    .exec();
};

Menu.statics.findAllMenus = function () {
  return this.find().populate("outlet");
};

/**
 * Order related
 */

Menu.statics.findAllActiveMenus = function () {
  const filterConditions = {
    activeMenu: true,
  };
  return this.find(filterConditions)
    .populate("outlet")
    .populate("foodBundles.foodItems")
    .exec();
};

Menu.statics.updateMenu = function (menuId, newMenu) {
  const update = {
    $set: {
      menuName: newMenu.menuName,
      activeMenu: newMenu.activeMenu,
      foodItems: newMenu.foodItems,
      menuCategories: newMenu.menuCategories,
      foodBundles: newMenu.foodBundles,
    },
  };
  return this.findByIdAndUpdate(menuId, update).exec();
};

Menu.statics.synchronizeFoodItems = function (
  outlet
) {
  return this.findOutletsByHawkerId(outlet.hawkerAccount._id)
  .then((outlets) => {
    for (let o of outlets) {
      this.updateOutletCashback(o._id, outlet.cashbackRate, outlet.cashbackIsActive)
    }
    return outlets;
  })
};

Menu.statics.synchronizeMenu = function (menu, outletIdArr) {
  const FoodItem = require("./FoodItem");

  // get all food items in all menu categories
  const foodItemsInMenu = [];
  menu.menuCategories.map((mc) => {
    mc.foodItems.map((fi) => {
      foodItemsInMenu.push(fi);
    });
  });

  // get all food items in menu
  menu.foodItems.map((fi) => {
    foodItemsInMenu.push(fi);
  });

  // get all food items in all food bundles
  menu.foodBundles.map((fb) => {
    fb.foodItems.map((fi) => {
      foodItemsInMenu.push(fi);
    });
  });

  // remove _id in all food items
  const newFoodItemsInMenu = foodItemsInMenu.map(({ _id, ...foodItem }) => foodItem);

  // get food items' names for comparison
  const foodItemNameArr = newFoodItemsInMenu.map(x => x.itemName);

  return FoodItem.synchroniseAllFoodItems(outletIdArr, newFoodItemsInMenu, 'addon')
    .then((created) => {
      return FoodItem.findFoodItemsByNameFromAllOutlets(foodItemNameArr, outletIdArr)
        .then((foodItems) => {
          const promises = outletIdArr.map((oId) => {
            let menuCategoryList = [];
            let foodItemsList = [];
            let foodBundleList = [];
            // package the food items into the menu categories and update in selected outlet menus
            for(let mc of menu.menuCategories) {
              delete mc._id;
              let newMenuCategory = _.cloneDeep(mc);
              let newFoodItemsForMenuCategory = [];

              for (let fi of mc.foodItems) {
                let foodItemFromOutlet = foodItems.find(item => item.itemName === fi.itemName && item.outlet.toString() === oId);
                newFoodItemsForMenuCategory.push(foodItemFromOutlet);
              }

              newMenuCategory.foodItems = newFoodItemsForMenuCategory;
              menuCategoryList.push(newMenuCategory);
            }

            // package the food items and update in selected outlet menus
            for(let foodItem of menu.foodItems) {
              let foodItemFromOutlet = foodItems.find(item => item.itemName === foodItem.itemName && item.outlet.toString() === oId);
              foodItemsList.push(foodItemFromOutlet);
            }

            // package the food items into the food bundles and update in selected outlet menus
            for (let fb of menu.foodBundles) {
              delete fb._id;
              let newFoodBundle = _.cloneDeep(fb);
              let newFoodItemsForFoodBundle = [];
              for (let fi of fb.foodItems) {
                let foodItemFromOutlet = foodItems.find(item => item.itemName === fi.itemName && item.outlet.toString() === oId);
                newFoodItemsForFoodBundle.push(foodItemFromOutlet); 
              }
              newFoodBundle.foodItems = newFoodItemsForFoodBundle;
              foodBundleList.push(newFoodBundle);
            }

            // unset id and assign all updated food items to menu
            // let menuToSync = _.cloneDeep(menu);

            this.findMenusByOutletId(oId).then((existingMenus) => {
              // if outlet have active menu
              if (menu.activeMenu === true){
                if(existingMenus.some(m => m.activeMenu === true)) {
                  let menuActive = existingMenus.filter(m => m.activeMenu === true)[0];                         
                  menuActive.activeMenu = false;

                  this.updateMenu(menuActive._id, menuActive);
                } else {
                  menu.activeMenu = true;
                }
              } else {
                menu.activeMenu = false;
              }

              _.unset(menu, '_id');
              menu = {
                ...menu, 
                menuCategories: menuCategoryList, 
                foodItems: foodItemsList,
                foodBundles: foodBundleList,
                outlet: oId,
              };

              // check if the current menu of master outlet exists in target outlets
              if(existingMenus.length === 0 || !existingMenus.some(m => m.menuName === menu.menuName)) {
    
                this.createNewMenu(menu);
              } else if(existingMenus.length > 0) {
                existingMenus.map((existMenu) => {
                  if(existMenu.menuName === menu.menuName){
     
                    this.updateMenu(existMenu._id, menu);
                  }
                });
              }

            });
          });
          return Promise.all(promises);
        });
    });
}

Menu.statics.findMenusByMenuNameAcrossOutlet = function (menuToSync, outletIdArr) {
  const filter = {
    outlet: {
      $in: outletIdArr
    },
    menuName: menuToSync.menuName
  };
  return this.find(filter)
    .populate("foodItems")
    .populate("outlet")
    .populate("menuCategories.foodItems")
    .populate("foodBundles.foodItems")
    .exec()
}

Menu.statics.synchronizeMenuDelete = function (menuToSync, outletIdArr) {
  return this.findMenusByMenuNameAcrossOutlet(menuToSync, outletIdArr)
    .then((menusOfTargetOutlets) => {
      menusOfTargetOutlets.map((menu) => {
        return this.deleteMenu(menu._id.toString());
    });
  });
}

Menu.statics.synchronizeMultipleMenus = function (menuArr, outletIdArr) {
  const promises = menuArr.map((menu) => {
    return this.synchronizeMenu(menu, outletIdArr);
  });
  return Promise.all(promises);
}

Menu.statics.updateMenuCategoriesAcrossMenus = function (menuIdArr, menuCategoryArr, outletId) {
  const filter =  {
    _id: {
      $in: menuIdArr
    },
    outlet: outletId
  };
  const update = {
    $set: {
      menuCategories: menuCategoryArr
    },
  };
  return this.updateMany(filter, update).exec();
}

Menu.statics.synchronizeMenuCategories = function (
  menuArr, 
  menuCategoryArr,
  outletIdArr
  ) {
    const FoodItem = require("./FoodItem");
    const menuIdArr = menuArr.map(menu => menu._id);

    // get all food items in all menu categories
    const foodItemsInMenuCategoryArr = [];
    menuCategoryArr.map((mc) => {
      mc.foodItems.map((fi) => {
        foodItemsInMenuCategoryArr.push(fi);
      });
    });
    
    // remove _id in all food items
    const newFoodItemsInMenuCategoryArr = foodItemsInMenuCategoryArr.map(({ _id, ...foodItem }) => foodItem);
    // get food items' names for comparison
    const foodItemNameArr = newFoodItemsInMenuCategoryArr.map(x => x.itemName);

    // add food items into all selected outlets if does not exist
    return FoodItem.synchroniseAllFoodItems(outletIdArr, newFoodItemsInMenuCategoryArr, 'addon')
      .then((created) => {
        return FoodItem.findFoodItemsByNameFromAllOutlets(foodItemNameArr, outletIdArr)
        .then((foodItems) => {
          // package the food items into the menu category and update in selected outlet menus
          for (let oId of outletIdArr) {
            let newMenuCategoryList = [];
            for (let mc of menuCategoryArr) {
              delete mc._id;
              let newMenuCategory = _.cloneDeep(mc);
              let newFoodItemsForMenuCategory = [];
              for (let fi of mc.foodItems) {
                let foodItemFromOutlet = foodItems.find(item => item.itemName === fi.itemName && item.outlet.toString() === oId);
                newFoodItemsForMenuCategory.push(foodItemFromOutlet);
              }
              newMenuCategory.foodItems = newFoodItemsForMenuCategory;
              newMenuCategoryList.push(newMenuCategory);
            }
            return this.updateMenuCategoriesAcrossMenus(menuIdArr, newMenuCategoryList, oId);
            }
        });
      });
}

Menu.statics.findMenuCategoryByCatNameAcrossMenu = function (menuIdArr, menuCategory, outletIdArr) {
  const filter = {
    _id: {
      $in: menuIdArr
    },
    outlet: {
      $in: outletIdArr
    },
    menuCategories: {
      $elemMatch: {
        categoryName: menuCategory.categoryName
      }
    }
  }
  return this.find(filter)
  .populate("menuCategories.foodItems")
  .exec()
}

Menu.statics.findMenusByOutlets = function (menuIdArr, outletIdArr) {
  const filter = {
    _id: {
      $in: menuIdArr
    },
    outlet: {
      $in: outletIdArr
    }
  }
  return this.find(filter)
    .populate("menuCategories.foodItems")
    .exec()
}

Menu.statics.updateMenuCategoryInMenu = function (menuId, menuCategory, updateType) {
  let filter = {};
  let update = {};

  if(updateType === 'set') {
    filter =  {
      _id: menuId,
      menuCategories: {
        $elemMatch: {
          _id: menuCategory._id
        }
      }
    };

    update = {
      $set: { 
        'menuCategories.$.categoryName': menuCategory.categoryName,
        'menuCategories.$.foodItems': menuCategory.foodItems,
      },
    };
    
  } else {
    filter =  {
      _id: menuId
    };

    update = {
      $push: { menuCategories: menuCategory }
    };
  }
  
  return this.updateMany(filter, update).exec();
}

Menu.statics.createNewFoodItemsForMenuCategoryAndUpdate = function (menus, menuCategory, newFoodItemsInMenuCategoryArr, foodItemNameArr, outletIdArr, updateType) {
  const FoodItem = require("./FoodItem");
  // create food item in newOutletIdArr if it does not exist
  return FoodItem.synchroniseAllFoodItems(outletIdArr, newFoodItemsInMenuCategoryArr, 'addon')
    .then((created) => {
      return FoodItem.findFoodItemsByNameFromAllOutlets(foodItemNameArr, outletIdArr)
        .then((foodItems) => {
      
          for(let m of menus) {
            let newFoodItems = [];
            let newMenuCategory =  _.cloneDeep(menuCategory);

            // if the operation is to synchronise update, set the menu category id to the current menu category id of target menu
            if (updateType === 'set') {
              let currentMenuCategory = m.menuCategories.find(cat => cat.categoryName === menuCategory.categoryName);
              newMenuCategory._id = currentMenuCategory._id;
            } 

            for (let fi of menuCategory.foodItems) {
              let foodItemFromOutlet = foodItems.find(item => item.itemName === fi.itemName && item.outlet.toString() === m.outlet.toString());
              newFoodItems.push(foodItemFromOutlet);
            }
            newMenuCategory.foodItems = newFoodItems;

            return this.updateMenuCategoryInMenu(m._id, newMenuCategory, updateType);
          }
      });
  });
}

Menu.statics.synchronizeMenuCategoryUpdate = function (menuIdArr, menuCategory, outletIdArr) {
  delete menuCategory._id;

  // get all food items in all menu categories
  const foodItemsInMenuCategoryArr = [];
  menuCategory.foodItems.map((fi) => {
    foodItemsInMenuCategoryArr.push(fi);
  });

  // remove _id in all food items
  const newFoodItemsInMenuCategoryArr = foodItemsInMenuCategoryArr.map(({ _id, ...foodItem }) => foodItem);
  // get food items' names for comparison
  const foodItemNameArr = newFoodItemsInMenuCategoryArr.map(x => x.itemName);

  return this.findMenuCategoryByCatNameAcrossMenu(menuIdArr, menuCategory, outletIdArr)
    .then((menus) => {
      // if the target menu has the same menu category
      if (menus.length > 0) { 
        // get the list of outlets from the menus that have the same category name
        const newOutletIdArr = menus.map(x => x.outlet);
 
        return this.createNewFoodItemsForMenuCategoryAndUpdate(menus, menuCategory, newFoodItemsInMenuCategoryArr, foodItemNameArr, newOutletIdArr, 'set');

       }
       // if the target menu does not have the same menu category, we have to create one for the menu
       else { 
         // find all menus of the target outlets
         return this.findMenusByOutlets (menuIdArr, outletIdArr)
          .then((allOutletsMenus) => {
            
            return this.createNewFoodItemsForMenuCategoryAndUpdate(allOutletsMenus, menuCategory, newFoodItemsInMenuCategoryArr, foodItemNameArr, outletIdArr, 'push');
          });
       }
    });
}

Menu.statics.synchroniseMenuCategoryDelete = function (menuCategoryName, menuIdArr) {
  const filter =  {
    _id: {
      $in: menuIdArr
    }
  };
  const update = {
    $pull: {
      menuCategories: {
        categoryName: menuCategoryName
      }
    },
  };
  return this.updateMany(filter, update).exec();
}

Menu.statics.updateFoodItemsAcrossMenus = function (menuIdArr, foodItemArr) {
  const foodItemIdArr = foodItemArr.map(a => a._id);
  const filter =  {
    _id: {
      $in: menuIdArr
    }
  };
  const update = {
    $set: {
      foodItems: foodItemIdArr
    },
  };
  return this.updateMany(filter, update).exec();
}

Menu.statics.synchronizeFoodItemsAcrossMenus = function (menuIdArr, foodItemArr, outletIdArr) {
  const FoodItem = require("./FoodItem");
  const newFoodItems = foodItemArr.map(({ _id, ...foodItem }) => foodItem);
  const foodItemNameArr = foodItemArr.map(a => a.itemName);

  return FoodItem.synchroniseAllFoodItems (
    outletIdArr,
    newFoodItems,
    'addon'
  )
  .then((food) => {
    for (let oId of outletIdArr) {
      FoodItem.findFoodItemsByName(foodItemNameArr, oId)
      .then((createdFoodItems) => {
        this.updateFoodItemsAcrossMenus(menuIdArr, createdFoodItems);
      })
    }
  });
}


Menu.statics.synchroniseFoodItemDeleteAcrossMenus = function (foodItemName, menuIdArr, outletIdArr) {
  const FoodItem = require("./FoodItem");
  const foodItemNameArr = [];
  foodItemNameArr.push(foodItemName);
  return FoodItem.findFoodItemsByNameFromAllOutlets(foodItemNameArr, outletIdArr)
  .then((foodItems) => {
    let foodItemIdArr = [{ type: Schema.Types.ObjectId, ref: "FoodItem" }]
    foodItemIdArr = foodItems.map(x => mongoose.Types.ObjectId(x._id));
    const filter =  {
      _id: {
        $in: menuIdArr
      }
    };
    const update = {
      $pull: {
        foodItems: {
          $in: foodItemIdArr
        }
      },
    };
    return this.updateMany(filter, update).exec();
  })
}

Menu.statics.updateFoodBundlesAcrossMenus = function (menuIdArr, foodBundleArr, outletId) {
  const filter =  {
    _id: {
      $in: menuIdArr
    },
    outlet: outletId
  };
  const update = {
    $set: {
      foodBundles: foodBundleArr
    },
  };
  return this.updateMany(filter, update).exec();
}

// 1. get all food items from all food bundles
// 2. check if food items exist in selected outlets and create in each outlet if does not exist
// 3. once created, retrieve all food items from selected outlets (consists of same food items but with unique _id from different outlets)
// 4. loop through each of the selected outlet, package the food bundle, and update the menus with the new food bundle with relevant food item
Menu.statics.synchronizeFoodBundlesAcrossMenus = function (menuIdArr, foodBundleArr, outletIdArr) {
  const FoodItem = require("./FoodItem");

  // get all food items in all food bundles
  const foodItemsInFoodBundlesArr = [];
  for (let fb of foodBundleArr) {
    for (let fi of fb.foodItems) {
      foodItemsInFoodBundlesArr.push(fi.foodItem);
    }
  }
  // remove _id in all food items
  const newFoodItemsInFoodBundlesArr = foodItemsInFoodBundlesArr.map(({ _id, ...foodItem }) => foodItem);
  // get food items' names for comparison
  const foodItemNameArr = newFoodItemsInFoodBundlesArr.map(x => x.itemName);

  // create food items into all selected outlets if does not exist
  return FoodItem.synchroniseAllFoodItems(outletIdArr, newFoodItemsInFoodBundlesArr, 'addon')
  .then((created) => {
    // retrieve all created food items from selected outlets
    FoodItem.findFoodItemsByNameFromAllOutlets(foodItemNameArr, outletIdArr)
    .then((foodItems) => {
      // package the food items into the required food bundle and update in selected outlet menus
      for (let oId of outletIdArr) {
        let newFoodBundlesList = [];
        for (let fb of foodBundleArr) {
          delete fb._id;
          let newFoodBundle = _.cloneDeep(fb);
          let newFoodItemsForFoodBundle = [];
          for (let fi of fb.foodItems) {
            let foodItemFromOutlet = foodItems.find(x => x.itemName === fi.foodItem.itemName && x.outlet.toString() === oId);
            for (let qty=1;qty<=fi.qty;qty++) {
              newFoodItemsForFoodBundle.push(foodItemFromOutlet);
            }
          }
          newFoodBundle.foodItems = newFoodItemsForFoodBundle;
          newFoodBundlesList.push(newFoodBundle);
        }
        //update outlet foodBundles;
        this.updateFoodBundlesAcrossMenus(menuIdArr, newFoodBundlesList, outletIdArr)
      }
      return true;
    })
  })
}

Menu.statics.updateFoodBundleInMenu = function (menuId, foodBundle) {
  const filter =  {
    _id: menuId,
    foodBundles: {
      $elemMatch: {
        _id: foodBundle._id
      }
    }
  };
  // update specific food bundle in array of food bundles
  const update = {
    $set: { 
      'foodBundles.$.foodItems': foodBundle.foodItems,
      'foodBundles.$.bundleName': foodBundle.bundleName,
      'foodBundles.$.bundlePrice': foodBundle.bundlePrice,
      'foodBundles.$.isPromotion': foodBundle.isPromotion,
      'foodBundles.$.bundleImgSrc': foodBundle.bundleImgSrc,
    },
  };
  return this.updateMany(filter, update).exec();
}

Menu.statics.addNewFoodBundleInMenu = function (menuId, foodBundle) {
  const filter =  {
    _id: menuId,
  };
  const update = {
    $push: { 
      foodBundles: foodBundle
    },
  };
  return this.updateMany(filter, update).exec();
}

Menu.statics.findFoodBundleByNameAcrossMenu = function (menuIdArr, foodBundle, outletIdArr) {
  const filter = {
    _id: {
      $in: menuIdArr
    },
    outlet: {
      $in: outletIdArr
    },
    foodBundles: {
      $elemMatch: {
        bundleName: foodBundle.bundleName
      }
    }
  }
  return this.find(filter)
  .populate("foodBundles.foodItems")
  .exec()
}

Menu.statics.findMenusByIds = function (menuIdArr) {
  const filter = {
    _id: {
      $in: menuIdArr
    }
  }
  return this.find(filter)
  .populate("foodBundles.foodItems")
  .exec()
}

Menu.statics.synchronizeFoodBundleUpdateAcrossMenus = function (menuIdArr, foodBundle, outletIdArr) {
  const FoodItem = require("./FoodItem");
  
  delete foodBundle._id;

  // get all food items in food bundle
  const foodItemsInFoodBundlesArr = [];
  for (let fi of foodBundle.foodItems) {
    foodItemsInFoodBundlesArr.push(fi.foodItem);
  }
  // get food items' names for comparison
  const foodItemNameArr = foodItemsInFoodBundlesArr.map(x => x.itemName);
  // remove _id in all food items
  const newFoodItemsInFoodBundlesArr = foodItemsInFoodBundlesArr.map(({ _id, ...foodItem }) => foodItem);

  // find the same food bundle in selected menus
  return this.findFoodBundleByNameAcrossMenu(menuIdArr, foodBundle, outletIdArr)
    .then((menus) => {
      // if there exists menus with the same food bundle name
      let newMenuIdArr = menus.map(x => x._id.toString());
      let difference = menuIdArr.filter(x => !newMenuIdArr.includes(x));
      return this.findMenusByIds(difference)
      .then((menusToCreate) => {
        // create food item in newOutletIdArr if it does not exist
        return FoodItem.synchroniseAllFoodItems(outletIdArr, newFoodItemsInFoodBundlesArr, 'addon')
        .then((created) => {
          // retrieve all food items from newOutletIdArr
          return FoodItem.findFoodItemsByNameFromAllOutlets(foodItemNameArr, outletIdArr)
          .then((foodItems) => {
            // update existing food bundles
            for (let m of menus) {
              let currentFoodBundle = m.foodBundles.find(x => x.bundleName === foodBundle.bundleName);
              let newFoodItems = [];
              let newFoodBundle = _.cloneDeep(foodBundle);
              newFoodBundle._id = currentFoodBundle._id;
              for (let fi of foodBundle.foodItems) {
                let foodItemFromOutlet = foodItems.find(x => x.itemName === fi.foodItem.itemName && x.outlet.toString() === m.outlet.toString());
                for (let qty=1;qty<=fi.qty;qty++) {
                  newFoodItems.push(foodItemFromOutlet);
                }
              }
              newFoodBundle.foodItems = newFoodItems;
              this.updateFoodBundleInMenu(m._id, newFoodBundle);
            }
            // create new food bundle
            for (let nm of menusToCreate) {
              let newFoodItems = [];
              let newFoodBundle = _.cloneDeep(foodBundle);
              delete newFoodBundle._id;
              for (let fi of foodBundle.foodItems) {
                let foodItemFromOutlet = foodItems.find(x => x.itemName === fi.foodItem.itemName && x.outlet.toString() === nm.outlet.toString());
                for (let qty=1;qty<=fi.qty;qty++) {
                  newFoodItems.push(foodItemFromOutlet);
                }
              }
              newFoodBundle.foodItems = newFoodItems;
              this.addNewFoodBundleInMenu(nm, newFoodBundle);
            }
          });
        });
      });
  });
}

Menu.statics.synchroniseFoodBundleDelete = function (foodBundleName, menuIdArr) {
  const filter =  {
    _id: {
      $in: menuIdArr
    }
  };
  const update = {
    $pull: {
      foodBundles: {
        bundleName: foodBundleName
      }
    },
  };
  return this.updateMany(filter, update).exec();
}

export default mongoose.model("Menu", Menu, "Menu");
