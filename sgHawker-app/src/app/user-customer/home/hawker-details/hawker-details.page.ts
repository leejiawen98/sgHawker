/* eslint-disable object-shorthand */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonBackButtonDelegate, NavController, PopoverController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';

import { MenuService } from '../../../services/menu.service';
import { SessionService } from '../../../services/session.service';
import { FoodBasketService } from '../../../services/food-basket.service';

import { Menu } from '../../../models/menu';
import { User } from '../../../models/user';
import { MenuCategory } from '../../../models/submodels/menuCategory';
import { FoodBundle } from '../../../models/submodels/foodBundle';
import { FoodItem } from '../../../models/foodItem';
import { Outlet } from '../../../models/outlet';
import { FoodBundleDetailModalComponent } from '../../../shared/cartCustomization/food-bundle-detail-modal/food-bundle-detail-modal.component';
import { FoodItemCustomizeModalComponent } from '../../../shared/cartCustomization/food-item-customize-modal/food-item-customize-modal.component';
import { OutletService } from '../../../services/outlet.service';
import { ViewCashbackModalComponent } from './view-cashback-modal/view-cashback-modal.component';
import { PopoverComponentComponent } from 'src/app/shared/popover-component/popover-component.component';

@Component({
  selector: 'app-hawker-details',
  templateUrl: './hawker-details.page.html',
  styleUrls: ['./hawker-details.page.scss'],
})
export class HawkerDetailsPage implements OnInit {

  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;

  user: User;
  outlet: Outlet;
  outletIsActive: boolean;
  activeMenu: Menu;
  showBackButton: boolean;

  menuCategories: MenuCategory[];
  foodItemCategories: MenuCategory[]; // dynamically create menu category base on food items
  foodBundles: FoodBundle[];
  recommendedFoodItems: FoodItem[];

  // filtering and searching
  allCategories: string[];
  selectedCategories: string[];
  searchString: string;
  originalMenuCategories: MenuCategory[];
  originalFoodItemCategories: MenuCategory[];

  originalFoodBundles: FoodBundle[];
  originalRecommendedItems: FoodItem[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private menuService: MenuService,
    private modalController: ModalController,
    private alertController: AlertController,
    public foodBasketService: FoodBasketService,
    public outletService: OutletService,
    private sessionService: SessionService,
    private popoverController: PopoverController,
    public navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    if (this.user || (this.sessionService.getIsGuestHawkerCenter() && this.sessionService.getIsGuest())) {
      this.showBackButton = true;
    } else {
      this.showBackButton = false;
    }
    const outletId = this.activatedRoute.snapshot.params.hawkerOutletId;
    this.menuService
      .retrieveActiveMenuForOutlet(outletId)
      .subscribe(
        activeMenu => {
          this.activeMenu = activeMenu;
          this.outlet = activeMenu.outlet;
          this.foodBundles = activeMenu.foodBundles;
          this.foodBasketService.activeMenu = activeMenu;

          this.outletIsActive = this.outletService.checkOutletIsActive(this.outlet);

          this.menuCategories = _.filter(activeMenu.menuCategories, menuCategory => {
            if (menuCategory.categoryName === 'Recommended') {
              // retrieve and assign recommended categories
              this.recommendedFoodItems = menuCategory.foodItems;
              return false;
            } else {
              return true;
            }
          });
          this.originalMenuCategories = _.cloneDeep(this.menuCategories);

          // generate food categories
          const foodItemCategoryMap = new Map();
          _.forEach(activeMenu.foodItems, item => {
            if (foodItemCategoryMap.get(item.itemCategory)) {
              const tempArr = foodItemCategoryMap.get(item.itemCategory);
              tempArr.push(item);
              foodItemCategoryMap.set(item.itemCategory, tempArr);
            } else {
              const tempArr = [];
              tempArr.push(item);
              foodItemCategoryMap.set(item.itemCategory, tempArr);
            }
          });

          this.foodItemCategories = [];
          for (const [key, value] of foodItemCategoryMap.entries()) {
            this.foodItemCategories.push(new MenuCategory(undefined, key, value));
          };
          this.originalFoodItemCategories = _.cloneDeep(this.foodItemCategories);

          this.initAllCategories();
        },
        error => {
          this.alertController.create({
            header: 'Oops...Something went wrong',
            message: 'Unable to load menu: ' + error,
            buttons: [
              {
                text: 'Go Back',
                role: 'OK',
                handler: () => {
                  this.router.navigate(['/customer/home']);
                }
              }
            ]
          }).then(alertElement => {
            alertElement.present();
          });
        }
      );
  }

  ionViewDidEnter() {
    if (this.backButton) {
      this.setBackButtonAction();
    }
  }

  isActive(): boolean {
    return this.outletService.checkOutletIsActive(this.outlet);
  }

  navigateToCart() {
    this.router.navigate(['/customer/activity/cart']);
  }

  private resetMenu() {
    this.menuCategories = _.cloneDeep(this.originalMenuCategories);
    this.foodItemCategories = _.cloneDeep(this.originalFoodItemCategories);
    this.foodBundles = _.cloneDeep(this.originalFoodBundles);
    this.recommendedFoodItems = _.cloneDeep(this.originalRecommendedItems);
  }

  private initAllCategories() {
    this.allCategories = [];
    this.selectedCategories = [];
    this.allCategories.push('All categories');
    this.menuCategories.forEach(category => {
      this.allCategories.push(category.categoryName);
    });
    this.foodItemCategories.forEach(category => {
      this.allCategories.push(category.categoryName);
    });
    // clone for filtering
    this.originalMenuCategories = _.cloneDeep(this.menuCategories);
    this.originalFoodItemCategories = _.cloneDeep(this.foodItemCategories);
    this.originalFoodBundles = _.cloneDeep(this.foodBundles);
    this.originalRecommendedItems = _.cloneDeep(this.recommendedFoodItems);
  }

  filterFoodByName() {
    if (!this.searchString || this.searchString.length === 0) {
      this.resetMenu();
      return;
    } else {
      this.menuCategories = [];
      this.foodItemCategories = [];
      this.filterCategory(this.menuCategories, this.originalMenuCategories);
      this.filterCategory(this.foodItemCategories, this.originalFoodItemCategories);
      this.foodBundles = _.filter(this.originalFoodBundles, foodBundle =>
        _.filter(foodBundle?.foodItems, foodItem => {
          let valid = false;
          if (foodItem.itemName?.toUpperCase().includes(this.searchString.toUpperCase())) {
            valid = true;
          }
          return valid;
        }).length > 0
      );
      this.recommendedFoodItems = _.filter(this.recommendedFoodItems, item => item.itemName.includes(this.searchString));
    }
  }

  private filterCategory(targetArr, sourceArr) {
    _.forEach(sourceArr, menuCategory => {
      const tempMenuCategory = new MenuCategory();
      tempMenuCategory.categoryName = menuCategory.categoryName;
      tempMenuCategory.foodItems = [];
      _.forEach(menuCategory.foodItems, foodItem => {
        if (foodItem.itemName.toLowerCase().trim().includes(this.searchString.toLowerCase().trim())) {
          tempMenuCategory.foodItems.push(foodItem);
        }
      });
      if (tempMenuCategory.foodItems.length > 0) {
        targetArr.push(tempMenuCategory);
      }
    });
  }

  filterCategories() {
    if (!this.selectedCategories || this.selectedCategories.length === 0) {
      this.resetMenu();
      return;
    }
    this.menuCategories = [];
    this.foodItemCategories = [];
    _.forEach(this.selectedCategories, category => {
      if (category === 'All categories') {
        this.resetMenu();
        return;
      } else {
        _.forEach(this.originalFoodItemCategories, foodCategory => {
          if (foodCategory.categoryName === category) {
            this.foodItemCategories.push(foodCategory);
          }
        });
        _.forEach(this.originalMenuCategories, menuCategory => {
          if (menuCategory.categoryName === category) {
            this.menuCategories.push(menuCategory);
          }
        });
      }
    });
  }

  async showAlert(msg) {
    const alert = await this.alertController.create({
      message: msg,
      buttons: [
        {
          text: 'Okay',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async showFoodBundleModal(foodBundle: FoodBundle) {
    for (const item of foodBundle.foodItems) {
      if (item.itemAvailability === false) {
        this.showAlert('Food bundle is not available!');
        return;
      }
    }

    const modal = await this.modalController.create({
      component: FoodBundleDetailModalComponent,
      componentProps: {
        foodBundle: _.cloneDeep(foodBundle),
        currentUser: this.user,
        isGuest: this.sessionService.getIsGuest(),
      }
    });

    await modal.present();
  }

  async showFoodItemModal(foodItem: FoodItem) {
    if (foodItem.itemAvailability === false) {
      this.showAlert('Food item is not available!');
      return;
    };

    const modal = await this.modalController.create({
      component: FoodItemCustomizeModalComponent,
      componentProps: {
        foodItem: _.cloneDeep(foodItem),
        currentUser: this.user,
        isGuest: this.sessionService.getIsGuest(),
        // 'outletIsActive': this.outletIsActive
      }
    });

    await modal.present();
  }

  async showCashbackModal(outlet: Outlet) {
    const modal = await this.modalController.create({
      component: ViewCashbackModalComponent,
      componentProps: {
        outlet: outlet
      },
      showBackdrop: true,
      backdropDismiss: false
    });

    await modal.present();
  }

  async presentPopover(ev) {
    const popoverItemProps = [
      {
        label: 'Scan QR Code',
        eventHandler: () => {
          this.router.navigate(['qr-code']);
        },
        type: 'QRCODE'
      }];

    this.popoverController
      .create({
        component: PopoverComponentComponent,
        cssClass: 'popover-class',
        componentProps: { items: popoverItemProps },
        translucent: true,
        event: ev,
      })
      .then((popOverElement) => {
        popOverElement.present();
      });
  }

  setBackButtonAction() {
    this.backButton.onClick = () => {
      this.navCtrl.navigateBack(`/customer/home/${this.outlet.hawkerCentreName}`);
    };
  }
}
