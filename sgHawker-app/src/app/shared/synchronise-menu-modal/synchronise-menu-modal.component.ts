/* eslint-disable radix */
/* eslint-disable object-shorthand */
/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Menu } from 'src/app/models/menu';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { MenuService } from 'src/app/services/menu.service';
import * as _ from 'lodash';
import { FoodItemService } from 'src/app/services/food-item.service';
import { FoodItem } from 'src/app/models/foodItem';
import { MenuCategory } from 'src/app/models/submodels/menuCategory';
import { FoodBundle } from 'src/app/models/submodels/foodBundle';
import { SynchroniseMenuInfoModalComponent } from '../synchronise-menu-info-modal/synchronise-menu-info-modal.component';

@Component({
  selector: 'app-synchronise-menu-modal',
  templateUrl: './synchronise-menu-modal.component.html',
  styleUrls: ['./synchronise-menu-modal.component.scss'],
})
export class SynchroniseMenuModalComponent implements OnInit {

  @Input() hawker: User;
  @Input() outlet: Outlet;
  @Input() type?: 'Menu' | 'Menus' | 'Menu-delete' | 'FoodItems' | 'FoodItem' | 'FoodItem-delete'
                |'FoodItemsInMenu' | 'FoodItemsInMenu-delete' | 'FoodBundle' | 'FoodBundle-delete' | 'FoodBundles'
                | 'MenuCategories' | 'MenuCategory' |'MenuCategory-delete';
  @Input() menuId?: string;
  @Input() menus?: Menu[];
  @Input() foodItems?: FoodItem[];
  @Input() foodItem?: FoodItem;
  @Input() foodItemNameBeforeUpdate?: string;
  @Input() foodBundles?: FoodBundle[];
  @Input() foodBundle?: FoodBundle;
  @Input() menuCategory?: MenuCategory;
  @Input() menu?: Menu;


  modalTitle: string;

  // menu
  menuToSynchronize: Menu;
  selectedOutlets: any[];
  allMenus: Menu[];
  menusOfSelectedOutlets: Menu[];
  selectedMenus: any[];
  menuSyncType: string;
  newMenuName: string;

  //menu categories
  menuCategoriesOfMenuToSync: MenuCategory[];
  selectMenuCategories: any[];

  //foodItem
  foodItemSyncType: string;
  selectedFoodItems: any[];

  constructor(
    private modalController: ModalController,
    private menuService: MenuService,
    private alertController: AlertController,
    private foodItemService: FoodItemService
  ) {
    this.menuToSynchronize = new Menu();
  }

  ngOnInit() {
    if (this.type === 'FoodItems') {
      this.modalTitle = 'Food Items';
    } else if (this.type === 'FoodItem' || this.type === 'FoodItem-delete') {
      this.modalTitle = 'Food Item';
    } else if (this.type === 'FoodItemsInMenu' || this.type === 'FoodItemsInMenu-delete') {
      this.modalTitle = 'Food Items Across Menus';
    } else if (this.type === 'FoodBundle' || this.type === 'FoodBundle-delete') {
      this.modalTitle = 'Food Bundle';
    } else if (this.type === 'FoodBundles') {
      this.modalTitle = 'Food Bundles';
    } else if (this.type === 'MenuCategories') {
      this.modalTitle = 'Menu Categories';
    } else if (this.type === 'MenuCategory') {
      this.modalTitle = 'Menu Category';
    } else {
      this.modalTitle = this.type;
    }
  }

  ionViewWillEnter() {
    // do not allow hawker to select the current outlet
    this.hawker.outlets = this.hawker.outlets.filter(outlet => outlet._id !== this.outlet._id);
    this.menuService.getAllMenus().subscribe(
      menus => {
        this.allMenus = menus;
      },
    );
    if (this.type === 'Menu' || this.type === 'MenuCategories'
      || this.type === 'FoodBundle-delete' || this.type === 'MenuCategory-delete' || this.type === 'FoodItemsInMenu-delete') {
      this.menuService.getMenuById(this.menuId).subscribe(
        (menu) => {
          this.menuToSynchronize = menu;
          this.menuCategoriesOfMenuToSync = menu.menuCategories;
        },
      );
    }
  }

  ionViewDidLeave() {
    this.allMenus = [];
    // this.groupedMenusByOutlets = [];
    this.menusOfSelectedOutlets = [];
    this.menus = [];
  }

  closeModal() {
    this.modalController.dismiss({ deleteIsSuccess: false });
  }

  setSelectedOutlets(event) {
    this.menusOfSelectedOutlets = [];
    if (event.detail.value[0] === 'all') {
      this.selectedOutlets = this.hawker.outlets;
    } else {
      this.selectedOutlets = event.detail.value;
    }

    const outlets = _.cloneDeep(this.selectedOutlets);

    outlets.map(outlet => {
      this.allMenus.filter(menu => menu.outlet._id === outlet._id).map(
        menu => {
          this.menusOfSelectedOutlets.push(menu);
        }
      );
    });
  }

  sync() {
    if (this.selectedOutlets.includes('all')) {
      this.selectedOutlets = this.hawker.outlets;
    }

    if (this.selectedMenus !== undefined && this.selectedMenus.includes('all')) {
      this.selectedMenus = this.menusOfSelectedOutlets;
    }

    if (this.type === 'Menu') {
      this.synchroniseMenu();
    } else if (this.type === 'Menu-delete') {
      this.synchroniseMenuDelete();
    } else if (this.type === 'Menus') {
      this.synchroniseAllMenus();
    } else if (this.type === 'FoodItems') {
      if (this.foodItemSyncType) {
        this.synchroniseAllFoodItems();
      }
      else {
        this.alertPopUp('Invalid', 'Please choose a sync type');
      }
    } else if (this.type === 'FoodItem') {
      this.synchroniseFoodItem();
    } else if (this.type === 'FoodItem-delete') {
      this.synchroniseFoodItemDelete();
    } else if (this.type === 'FoodItemsInMenu') {
      this.synchroniseFoodItemsAcrossMenu();
    } else if (this.type === 'FoodItemsInMenu-delete') {
      this.synchroniseFoodItemDeleteAcrossMenu();
    } else if (this.type === 'FoodBundles') {
      this.synchroniseFoodBundlesAcrossMenu();
    } else if (this.type === 'FoodBundle') {
      this.synchroniseFoodBundleUpdate();
    } else if (this.type === 'FoodBundle-delete') {
      this.synchroniseFoodBundleDelete();
    } else if (this.type === 'MenuCategories') {
      this.synchroniseMenuCategories();
    } else if (this.type === 'MenuCategory') {
      this.synchroniseMenuCategoryUpdate();
    } else if (this.type === 'MenuCategory-delete') {
      this.synchroniseMenuCategoryDelete();
    }
  }

  // FOOD ITEMS
  synchroniseAllFoodItems() {
    if (this.selectedFoodItems.includes('all')) {
      this.selectedFoodItems = this.foodItems;
    }
    const outletIdArray = this.selectedOutlets.map(a => a._id);
    // remove ID from each food item
    const newFoodItems = this.foodItems.map(({ _id, ...foodItem }) => foodItem);

    this.foodItemService.synchroniseAllFoodItemsAcrossOutlets(newFoodItems, outletIdArray, this.foodItemSyncType)
      .subscribe(
        res => {
          this.alertPopUp('Success', 'Food Items are now synchronised across selected outlets');
          this.closeModal();
        },
        (error) => this.alertPopUp('Oops', 'Failed to synchronize menu')
      );
  }

  synchroniseFoodItem() {
    const outletIdArray = this.selectedOutlets.map(a => a._id);
    this.foodItemService.synchroniseFoodItemUpdateAcrossOutlets(this.foodItem, outletIdArray, this.foodItemNameBeforeUpdate)
      .subscribe(
        res => {
          this.alertController.create({
            header: 'Success',
            message: 'Food Item update are now synchronised with selected outlets',
            buttons: [
              {
                text: 'Dismiss',
                role: 'cancel',
                handler: () => {
                  this.modalController.dismiss({
                    success: true
                  });
                }
              },
            ],
          }).then((alertElement) => {
            alertElement.present();
          });
        },
        (error) => this.alertPopUp('Oops', 'Failed to synchronise food item update')
      );
  }

  synchroniseFoodItemDelete() {
    const outletIdArray = this.selectedOutlets.map(a => a._id);
    this.foodItemService.synchroniseFoodItemDeleteAcrossOutlets(this.foodItem.itemName, outletIdArray)
    .subscribe(
      res => {
        this.alertController.create({
          header: 'Success',
          message: 'Food Item is now deleted across selected outlets',
          buttons: [
            {
              text: 'Dismiss',
              role: 'cancel',
              handler: () => {
                this.modalController.dismiss({
                  success: true
                });
              }
            },
          ],
        }).then((alertElement) => {
          alertElement.present();
        });
      },
      error => this.alertPopUp('Oops', 'Failed to synchronise food item delete')
    );
  }

  synchroniseFoodItemsAcrossMenu() {
    const outletIdArray = this.selectedOutlets.map(a => a._id);
    const menuIdArray = this.selectedMenus.map(a => a._id);
    if (this.selectedFoodItems.includes('all')) {
      this.selectedFoodItems = this.foodItems;
    }
    this.menuService.synchronizeFoodItemsAcrossMenus(this.selectedFoodItems, menuIdArray, outletIdArray)
      .subscribe(
        res => {
          this.alertPopUp('Success', 'Food Items are now synchronised across selected menus');
          this.closeModal();
        },
        err => this.alertPopUp('Oops', 'Failed to synchronise food item across different menus')
      );
  }

  synchroniseFoodItemDeleteAcrossMenu() {
    const menuIdArray = this.selectedMenus.map(a => a._id);
    menuIdArray.push(this.menuToSynchronize._id);
    const outletIdArray = this.selectedOutlets.map(a => a._id);
    outletIdArray.push(this.outlet._id);
    this.menuService.synchroniseFoodItemDeleteAcrossMenus(this.foodItem.itemName, menuIdArray, outletIdArray)
      .subscribe(
        res => {
          this.alertPopUp('Success', 'Food item in menu deletion is now synchronised across selected menus');
          this.modalController.dismiss({
            deleteIsSuccess: true
          });
        },
        err => this.alertPopUp('Oops', 'Failed to synchronise deletion of food item across different menus')
      );
  }

  synchroniseFoodBundlesAcrossMenu() {
    const outletIdArray = this.selectedOutlets.map(a => a._id);
    const menuIdArray = this.selectedMenus.map(a => a._id);
    if (this.selectedFoodItems.includes('all')) {
      this.selectedFoodItems = this.foodBundles;
    }

    this.menuService.synchronizeFoodBundlesAcrossMenus(this.selectedFoodItems, menuIdArray, outletIdArray)
      .subscribe(
        res => {
          this.alertPopUp('Success', 'Food Bundles are now synchronised across selected menus');
          this.closeModal();
        },
        err => this.alertPopUp('Oops', 'Failed to synchronise food bundles across different menus')
      );
  }

  synchroniseFoodBundleUpdate() {
    const outletIdArray = this.selectedOutlets.map(a => a._id);
    const menuIdArray = this.selectedMenus.map(a => a._id);

    this.menuService.synchronizeFoodBundleUpdate(this.foodBundle, menuIdArray, outletIdArray)
      .subscribe(
        res => {
          this.alertPopUp('Success', 'Food Bundles are now synchronised across selected menus');
          this.closeModal();
        },
        err => this.alertPopUp('Oops', 'Failed to synchronise food bundle update across different menus')
      );
  }

  synchroniseFoodBundleDelete() {
    const menuIdArray = this.selectedMenus.map(a => a._id);
    menuIdArray.push(this.menuToSynchronize._id);
    this.menuService.synchronizeFoodBundleDelete(this.foodBundle.bundleName, menuIdArray)
      .subscribe(
        res => {
          this.alertPopUp('Success', 'Food Bundle deletion is now synchronised across selected menus');
          this.modalController.dismiss({
            deleteIsSuccess: true
          });
        },
        err => this.alertPopUp('Oops', 'Failed to synchronise deletion of food bundle across different menus')
      );
  }

  changeRadio(ev: any) {
    switch (ev) {
      case 'replace':
        this.foodItemSyncType = 'replace';
        break;
      case 'addon':
        this.foodItemSyncType = 'addon';
        break;
    }
  }

  alertPopUp(header, message) {
    this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    }).then((alertElement) => {
      alertElement.present();
    });
  }

  synchroniseAllMenus() {
    let menus = _.cloneDeep(this.menus);

    // menus.find(menu => menu.activeMenu === true).activeMenu = false;
    const outletIdArr = this.selectedOutlets.map(outlet => outlet._id);

    menus = menus.sort((m1, m2) => m1.menuName - m2.menuName);

    this.menuService.synchronizeMultipleMenus(menus, outletIdArr).subscribe(
      response => {
        this.alertPopUp('Success', 'Menus are synchronized across outlets sucessfully');
        this.closeModal();
      },
      error => this.alertPopUp('Oops', 'Failed to synchronize menu')
    );
  }

  synchroniseMenu() {
    const menuToSynchronize = this.menuToSynchronize;

    // unset id and set active as false
    // menuToSynchronize.activeMenu = false;
    if (this.menuSyncType === 'new') {
      menuToSynchronize.menuName = this.newMenuName;
    }

    // get all the outlet ids
    const outletIdArr = this.selectedOutlets.map(outlet => outlet._id);

    this.menuService.synchronizeMenu(this.menuToSynchronize._id, menuToSynchronize, outletIdArr).subscribe(
      response => {
        this.alertPopUp('Success', 'Menu is synchronized across outlets sucessfully');
        this.closeModal();
      },
      error => this.alertPopUp('Oops', 'Failed to synchronize menu')
    );
  }

  synchroniseMenuCategories() {
    if (this.selectedMenus.includes('all')) {
      this.selectedMenus = this.menusOfSelectedOutlets;
    }
    if (this.selectMenuCategories.includes('all')) {
      this.selectMenuCategories = this.menuToSynchronize.menuCategories;
    }
    // get all the outlet ids
    const outletIdArr = this.selectedOutlets.map(outlet => outlet._id);

    this.menuService.synchronizeMenuCategories(this.selectedMenus, this.selectMenuCategories, outletIdArr).subscribe(
      response => {
        this.alertPopUp('Success', 'Menu categories are synchronized across outlets sucessfully');
        this.closeModal();
      },
      error => {
        this.alertPopUp('Oops', 'Failed to synchronize menu categories');
      }
    );
  }

  async showSynchroniseInformation() {
    const modal = await this.modalController.create({
      component: SynchroniseMenuInfoModalComponent,
      cssClass: 'synchronise-menu-modal-css',
      componentProps: {
        type: this.type,
      }
    });
    await modal.present();
  }

  synchroniseMenuCategoryUpdate() {
    const outletIdArray = this.selectedOutlets.map(outlet => outlet._id);
    const menuIdArray = this.selectedMenus.map(menu => menu._id);

    this.menuService.synchronizeMenuCategoryUpdate(this.menuCategory, menuIdArray, outletIdArray)
      .subscribe(
        res => {
          this.alertPopUp('Success', 'Menu Category is now synchronised across selected menus');
          this.closeModal();
        },
        err => this.alertPopUp('Oops', 'Failed to synchronise menu category across different menus')
      );
  }

  synchroniseMenuCategoryDelete() {
    const menuIdArray = this.selectedMenus.map(menu => menu._id);
    menuIdArray.push(this.menuToSynchronize);

    this.menuService.synchronizeMenuCategoryDelete(this.menuCategory.categoryName, menuIdArray)
      .subscribe(
        res => {
          this.alertPopUp('Success', 'Menu Category deletion is now synchronised across selected menus');
          this.modalController.dismiss({
            deleteIsSuccess: true
          });
        },
        err => this.alertPopUp('Oops', 'Failed to synchronise deletion of menu category across different menus')
      );
  }

  changeMenuSyncType(event) {
    switch (event) {
      case 'existing':
        this.menuSyncType = 'existing';
        break;
      case 'new':
        this.menuSyncType = 'new';
        break;
    }
  }

  synchroniseMenuDelete() {
    const outletIdArray = this.selectedOutlets.map(outlet => outlet._id);
    const menuToSynchronizeDelete = _.cloneDeep(this.menu);

    this.menuService.synchronizeMenuDelete(menuToSynchronizeDelete, outletIdArray).subscribe(
      res => {
        this.alertPopUp('Success', 'Menu deletion is now synchronised across selected menus');
          this.modalController.dismiss({
            deleteIsSuccess: true
        });
      },
      err => this.alertPopUp('Oops', 'Failed to synchronise deletion of menu across different outlets')
    );
  }

}
