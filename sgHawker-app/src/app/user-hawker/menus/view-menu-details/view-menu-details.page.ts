/* eslint-disable object-shorthand */
/* eslint-disable no-underscore-dangle */
/* eslint-disable arrow-body-style */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Menu } from 'src/app/models/menu';
import { MenuService } from 'src/app/services/menu.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Outlet } from 'src/app/models/outlet';
import { MenuCategory } from 'src/app/models/submodels/menuCategory';
import { FoodItemService } from 'src/app/services/food-item.service';
import * as _ from 'lodash';
import { FoodItem } from 'src/app/models/foodItem';
import { FoodBundleItem } from 'src/app/models/submodels/foodBundleItem';
import { FoodBundle } from 'src/app/models/submodels/foodBundle';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';
import { SynchroniseMenuModalComponent } from 'src/app/shared/synchronise-menu-modal/synchronise-menu-modal.component';
import { AccountTierEnum } from 'src/app/models/enums/account-tier-enum.enum';

@Component({
  selector: 'app-view-menu-details',
  templateUrl: './view-menu-details.page.html',
  styleUrls: ['./view-menu-details.page.scss'],
})
export class ViewMenuDetailsPage implements OnInit {
  baseUrl = '/api';

  allMenus: Menu[];
  menuId: string;
  menu: Menu;
  menuToSynchronise: Menu;
  menuToSynchroniseDelete: Menu;
  menuCatSegmentModel: string;
  foodCatSegmentModel: string;
  foodItemCategories: MenuCategory[] = [];
  hawker: User;
  outlet: Outlet;

  // search bar
  originalMenu: Menu;
  originalMenuCategories: MenuCategory[] = [];
  originalFoodItems: FoodItem[] = [];
  originalFoodBundles: FoodBundle[] = [];
  foodBundlesFoodItemArr: any[] = [];

  // filtering and searching
  allCategories: string[];
  selectedCategories: string[];
  searchString: string;
  filterOriginalMenuCategories: MenuCategory[] = [];
  filterOriginalFoodItemCategories: MenuCategory[] = [];

  constructor(
    public route: ActivatedRoute,
    private menuService: MenuService,
    public alertController: AlertController,
    public router: Router,
    private foodItemService: FoodItemService,
    private toastCtrl: ToastController,
    private sessionService: SessionService,
    private modalController: ModalController
  ) {
    this.menu = new Menu();
    this.outlet = new Outlet();
    this.originalMenu = new Menu();
    this.menu.outlet = new Outlet();
    this.menu.menuCategories = [];
    this.menu.foodItems = [];
    this.menu.foodBundles = [];
  }

  ngOnInit() {
    this.hawker = this.sessionService.getCurrentUser();
    this.outlet = this.sessionService.getCurrentOutlet();
    this.menuService.getMenuByOutlet(this.outlet._id).subscribe((resp) => {
      this.allMenus = resp;
    });
  }

  ionViewWillEnter() {
    this.menuId = this.route.snapshot.paramMap.get('id');
    this.getMenuDetailsById(this.menuId);
  }

  getMenuDetailsById(id) {
    this.menuService.getMenuById(id)
      .subscribe(
        menu => {
          this.menu = menu;
          this.menuToSynchroniseDelete = menu;
          this.originalMenu = menu;
          this.originalMenuCategories = menu.menuCategories;
          this.originalFoodItems = menu.foodItems;
          this.originalFoodBundles = menu.foodBundles;
          this.groupFoodItemsByCategory(menu.foodItems);
          this.groupFoodBundles(menu.foodBundles);

          if (this.foodItemCategories.length !== 0) {
            this.foodCatSegmentModel = this.foodItemCategories[0].categoryName;
          }
          if (menu.menuCategories.length !== 0) {
            this.menuCatSegmentModel = menu.menuCategories[0].categoryName;
          }

          this.initAllCategories();
        }
      );
  }

  groupFoodItemsByCategory(foodItems) {
    const foods = foodItems.slice();
    const category = new Set(foodItems.map(item => item.itemCategory));
    const groupedFoodItems = [];
    let originalGroupFoodItems = [];
    category.forEach(cat => groupedFoodItems.push({
      categoryName: cat,
      foodItems: foods.filter(food => food.itemCategory === cat)
    }));
    originalGroupFoodItems = groupedFoodItems;
    this.foodItemCategories = originalGroupFoodItems;
  }

  groupFoodBundles(foodBundles) {
    for (const foodBundle of foodBundles) {
      const foodBundleItemArr = [];
      for (const foodItem of foodBundle.foodItems) {
        const foodBundleItem = new FoodBundleItem();
        if (foodBundleItemArr.some((fbi) => fbi.foodItem.itemName === foodItem.itemName)) {
          foodBundleItemArr.forEach((item) => {
            if (item.foodItem.itemName === foodItem.itemName) {
              item.qty++;
            }
          });
        } else {
          foodBundleItem.foodItem = foodItem;
          foodBundleItem.qty = 1;
          foodBundleItemArr.push(foodBundleItem);
        }
      }
      foodBundle.foodItems = foodBundleItemArr;
    }
  }

  deleteMenu(isSync) {
    this.menuService
      .deleteMenu(this.menuId)
      .subscribe(
        res => {
          if (!isSync) {
            this.alertSuccessPopUp('Menu has been deleted.');
          } else {
            this.syncMenuDelete();
          }
        },
        error => {
          this.alertFailurePopUp('Unable to delete menu: ' + error);
        }
      );
  }

  alertDeleteConfirmPopUp() {
    this.alertController.create({
      message: 'Do you want to delete the menu?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.hawker.accountTier === AccountTierEnum.DELUXE && this.outlet.isMaster === true) {
              this.alertController.create({
                message: 'Do you want to synchronise the deletion of menu across other outlets?',
                buttons: [
                  {
                    text: 'Yes',
                    handler: () => {
                      this.deleteMenu(true);
                    }
                  },
                  {
                    text: 'No',
                    handler: () => {
                      this.deleteMenu(false);
                    }
                  }
                ]
              }).then(alert => {
                alert.present();
              });
            } else {
              this.deleteMenu(false);
            }
          }
        },
        {
          text: 'No',
          handler: () => { }
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    });
  }


  async alertSuccessPopUp(msg) {
    this.alertController.create({
      header: 'Success',
      message: msg,
      buttons: [
        {
          text: 'OK',
          role: 'OK',
          handler: () => {
            this.router.navigate(['/hawker/menus']);
          }
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    });
  }

  async alertFailurePopUp(msg) {
    this.alertController.create({
      header: 'Hmm..something went wrong',
      message: msg,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    });
  }

  editMenu() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        operation: 'editMenu',
      }
    };
    this.router.navigate(['/hawker/menus/create-menu/' + this.menu._id], navigationExtras);
  }

  alertUpdateItemAvailability(foodItem) {
    this.alertController.create({
      message: 'Do you want to update food availability?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.updateItemAvailability(foodItem);
          }
        },
        {
          text: 'No',
          handler: () => {
            foodItem.itemAvailability = !foodItem.itemAvailability;
          }
        }
      ],
      backdropDismiss: false
    }).then(alertElement => {
      alertElement.present();
    });
  }

  updateItemAvailability(foodItem) {
    let itemAvailability = '';
    if (foodItem.itemAvailability === true) {
      itemAvailability = 'available';
      this.foodItemService.enableFoodItemById(foodItem._id).subscribe(
        updatedFoodItem => {
          this.alertController.create({
            header: 'Success',
            message: 'Food item is set to ' + itemAvailability,
            buttons: [
              {
                text: 'OK',
                role: 'OK',
                handler: () => {
                  this.getMenuDetailsById(this.menuId);
                  return;
                }
              }
            ]
          }).then(alertElement => {
            alertElement.present();
          });
        }
      );
    } else {
      itemAvailability = 'unavailable';
      this.foodItemService.disableFoodItemById(foodItem._id).subscribe(
        updatedFoodItem => {
          this.alertController.create({
            header: 'Success',
            message: 'Food item is set to ' + itemAvailability,
            buttons: [
              {
                text: 'OK',
                role: 'OK',
                handler: () => {
                  this.getMenuDetailsById(this.menuId);
                  return;
                }
              }
            ]
          }).then(alertElement => {
            alertElement.present();
          });
        }
      );

    }
  }

  filterMenuByFood() {
    // reset the menu
    this.menu = _.cloneDeep(this.originalMenu);
    this.menu.foodItems = _.cloneDeep(this.originalFoodItems);
    this.menu.menuCategories = _.cloneDeep(this.originalMenuCategories);
    this.menu.foodBundles = _.cloneDeep(this.originalFoodBundles);

    // filter food under menu categories
    this.menu.menuCategories = this.menu.menuCategories.map((mc, index) => {
      this.menu.menuCategories[index].foodItems = mc.foodItems
        .filter((fi) => {
          if (fi.itemName.toLowerCase().indexOf(this.searchString.toLowerCase()) > -1) {
            return true;
          }
          return false;
        });
      return mc;
    });

    // filter food under food categories
    this.menu.foodItems = this.menu.foodItems
      .filter((fi) => {
        if (fi.itemName.toLowerCase().indexOf(this.searchString.toLowerCase()) > -1) {
          return true;
        }
        return false;
      });
  }

  duplicateMenu(name) {
    const duplicatedMenu = _.cloneDeep(this.menu);
    duplicatedMenu.menuName = name;
    duplicatedMenu.activeMenu = false;
    _.unset(duplicatedMenu, '_id');
    this.processFoodBundle(duplicatedMenu);
    this.menuService.createNewMenu(duplicatedMenu).subscribe(
      response => {
        this.alertSuccessPopUp('Menu duplicated');
      },
      error => {
        this.alertFailurePopUp(error);
      }
    );
  }

  async duplicateMenuAlert() {
    const alert = await this.alertController.create({
      header: 'Name your duplicated menu',
      inputs: [
        {
          name: 'menuName',
          type: 'text',
          placeholder: 'Menu Name'
        }
      ],
      buttons: [
        {
          text: 'Confirm',
          handler: data => {
            if (data.menuName) {
              this.duplicateMenu(data.menuName);
            } else {
              this.presentToast('Please input a name for your menu');
            }
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  // unpackage FoodBundleItem to an array of FoodItems in FoodBundle
  processFoodBundle(menu) {
    menu.foodBundles.forEach(fb => {
      const tempFoodItems = [];
      fb.foodItems.forEach(f => {
        for (let i = 0; i < f.qty; i++) {
          tempFoodItems.push(f.foodItem);
        }
      });
      fb.foodItems = tempFoodItems;
    });
  }

  initAllCategories() {
    this.allCategories = [];
    this.selectedCategories = [];
    this.allCategories.push('All categories');
    this.menu.menuCategories.forEach(category => {
      this.allCategories.push(category.categoryName);
    });
    this.foodItemCategories.forEach(category => {
      this.allCategories.push(category.categoryName);
    });

    this.filterOriginalMenuCategories = _.cloneDeep(this.menu.menuCategories);
    this.filterOriginalFoodItemCategories = _.cloneDeep(this.foodItemCategories);
  }

  resetMenu() {
    this.menu.menuCategories = _.cloneDeep(this.filterOriginalMenuCategories);
    this.foodItemCategories = _.cloneDeep(this.filterOriginalFoodItemCategories);
  }

  filterCategories() {
    if (!this.selectedCategories || this.selectedCategories.length === 0) {
      this.resetMenu();
      return;
    }
    this.foodItemCategories = [];
    this.menu.menuCategories = [];
    _.forEach(this.selectedCategories, category => {
      if (category === 'All categories') {
        this.resetMenu();
        return;
      } else {
        _.forEach(this.filterOriginalFoodItemCategories, foodCategory => {
          if (foodCategory.categoryName === category) {
            this.foodItemCategories.push(foodCategory);
            this.foodCatSegmentModel = this.foodItemCategories[0].categoryName;
          }
        });
        _.forEach(this.filterOriginalMenuCategories, menuCategory => {
          if (menuCategory.categoryName === category) {
            this.menu.menuCategories.push(menuCategory);
            this.menuCatSegmentModel = this.menu.menuCategories[0].categoryName;
          }
        });
      }
    });
  }

  async syncMenus() {
    const modal = await this.modalController.create({
      component: SynchroniseMenuModalComponent,
      cssClass: 'synchronise-menu-modal-css',
      componentProps: {
        hawker: this.hawker,
        outlet: this.outlet,
        type: 'Menus',
        menus: this.allMenus
      }
    });
    await modal.present();
  }

  async syncMenuDelete() {
    const modal = await this.modalController.create({
      component: SynchroniseMenuModalComponent,
      cssClass: 'synchronise-menu-modal-css',
      componentProps: {
        hawker: this.hawker,
        outlet: this.outlet,
        type: 'Menu-delete',
        menu: this.menuToSynchroniseDelete
      }
    });
    modal.onDidDismiss().then((data) => {
      if (data.data.deleteIsSuccess) {
        this.router.navigate(['/hawker/menus'])
      }
    });
    await modal.present();
  }

  async syncMenu(syncType: string) {
    const modal = await this.modalController.create({
      component: SynchroniseMenuModalComponent,
      cssClass: 'synchronise-menu-modal-css',
      componentProps: {
        hawker: this.hawker,
        outlet: this.outlet,
        type: syncType,
        menuId: this.menuId,
        foodItems: this.menu.foodItems,
        foodBundles: this.menu.foodBundles
      }
    });
    await modal.present();
  }

  async syncMenuCategory(menuCategory: MenuCategory, event: string) {
    const modal = await this.modalController.create({
      component: SynchroniseMenuModalComponent,
      cssClass: 'synchronise-menu-modal-css',
      componentProps: {
        hawker: this.hawker,
        outlet: this.outlet,
        type: event === 'update' ? 'MenuCategory' : 'MenuCategory-delete',
        menuId: this.menuId,
        menuCategory: menuCategory
      }
    });
    modal.onDidDismiss().then((data) => {
      if (event === 'delete' && data.data.deleteIsSuccess) {
        this.menu.menuCategories = this.menu.menuCategories.filter(mc => mc.categoryName !== menuCategory.categoryName);
        this.menuCatSegmentModel = this.menu.menuCategories[0].categoryName;
      }
    });
    await modal.present();
  }

  async syncFoodBundle(fb: FoodBundle, event: string) {
    const modal = await this.modalController.create({
      component: SynchroniseMenuModalComponent,
      cssClass: 'synchronise-menu-modal-css',
      componentProps: {
        hawker: this.hawker,
        outlet: this.outlet,
        type: event === 'update' ? 'FoodBundle' : 'FoodBundle-delete',
        menuId: this.menuId,
        foodBundle: fb,
      }
    });
    modal.onDidDismiss().then((data) => {
      if (event === 'delete' && data.data.deleteIsSuccess) {
        this.menu.foodBundles = this.menu.foodBundles.filter(x => x.bundleName !== fb.bundleName);
      }
    });
    await modal.present();
  }

  async syncFoodItem(fi: FoodItem) {
    const modal = await this.modalController.create({
      component: SynchroniseMenuModalComponent,
      cssClass: 'synchronise-menu-modal-css',
      componentProps: {
        hawker: this.hawker,
        outlet: this.outlet,
        type: 'FoodItemsInMenu-delete',
        menuId: this.menuId,
        foodItem: fi,
      }
    });
    modal.onDidDismiss().then((data) => {
      if (data.data.deleteIsSuccess) {
        this.menu.foodItems = this.menu.foodItems.filter(x => x._id !== fi._id);
        this.groupFoodItemsByCategory(this.menu.foodItems);
      }
    });
    await modal.present();
  }

}
