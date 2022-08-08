/* eslint-disable guard-for-in */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { OrderService } from './../../services/order.service';
import { PaymentTypeEnum } from './../../models/enums/payment-type-enum.enum';
import { WebsocketService } from './../../services/websocket.service';
import {
  ModalController,
  AlertController,
  ToastController,
} from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { FoodItem } from 'src/app/models/foodItem';
import { FoodBundle } from 'src/app/models/submodels/foodBundle';
import { OrderStatusEnum } from 'src/app/models/enums/order-status-enum.enum';
import * as moment from 'moment';
import * as _ from 'lodash';
import { CreateReportModalComponent } from '../create-report-modal/create-report-modal.component';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { MenuService } from './../../services/menu.service';
import { SessionService } from './../../services/session.service';
import { FoodBasketService } from './../../services/food-basket.service';
import { OutletService } from './../../services/outlet.service';
import { FoodBundleDetailModalComponent } from './../../shared/cartCustomization/food-bundle-detail-modal/food-bundle-detail-modal.component';
import { FoodItemCustomizeModalComponent } from './../../shared/cartCustomization/food-item-customize-modal/food-item-customize-modal.component';
import { EditOrderDetailModalComponent } from './../edit-order-detail-modal/edit-order-detail-modal.component';
import { OrderTypeEnum } from 'src/app/models/enums/order-type-enum.enum';

@Component({
  selector: 'app-order-detail-modal',
  templateUrl: './order-detail-modal.component.html',
  styleUrls: ['./order-detail-modal.component.scss'],
})
export class OrderDetailModalComponent implements OnInit {

  @Input() order: Order;
  @Input() dismissOrderDetailModal: () => void;
  baseUrl = '/api';

  tempOrder: Order;
  user: User;
  activeFoodItems: FoodItem[];
  activeFoodBundles: FoodBundle[];

  canReport: boolean;
  numberOfDaysAfterOrder: number;

  isRepeatingOrder: boolean;
  totalNumberOfItemsForRepeatOrder: number;
  currentNumberOfItems: number;

  canEditOrder: boolean;
  canCancelOrder: boolean;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private orderService: OrderService,
    private websocket: WebsocketService,
    private sessionService: SessionService,
    private menuService: MenuService,
    private outletService: OutletService,
    private foodBasketService: FoodBasketService,
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();

    this.websocket.onDeleteUnpaidCashOrderListener().subscribe(deletedOrder => {
      if (deletedOrder._id === this.order._id) {
        this.alertController.create({
          header: 'Current order is deleted!',
          message: 'This order has been deleted due to failure of making payment within 15 minutes',
          buttons: [
            {
              text: 'Go back',
              handler: () => this.closeModal()
            }
          ]
        });
      }
    });

    this.websocket.onCancelOrderListener().subscribe((cancelledOrder) => {
      if (cancelledOrder._id === this.order._id) {
        this.order = cancelledOrder;
      }
    });

    this.websocket.onUpdateOrderStatusListener().subscribe((updatedOrder) => {
      if (updatedOrder._id === this.order._id) {
        this.order = updatedOrder;
      }
    });

    this.websocket.onDelivererUpdateListener().subscribe((updatedOrder) => {
      if (updatedOrder._id === this.order._id) {
        this.order = updatedOrder;
      }
    });

    if (
      (this.order.orderStatus === OrderStatusEnum.UNPAID || this.order.orderStatus === OrderStatusEnum.PAID)
      && moment(this.order.orderCreationTime).isAfter(moment().subtract(30, 'seconds'))
    ) {
      this.canEditOrder = true;
      setTimeout(() => {
        this.canEditOrder = false;
      }, 30000);
    }

    if (moment(this.order.orderCreationTime).isAfter(moment().subtract(30, 'seconds')) && this.checkCanCancelOrder()) {
      this.canCancelOrder = true;
      setTimeout(() => {
        this.canCancelOrder = false;
      }, 30000);
    }

  }

  ionViewWillEnter() {
    this.numberOfDaysAfterOrder = Math.abs(moment.duration(moment(this.order.completedTime).diff(moment(new Date()))).asHours());

    this.canReport = (this.order.orderStatus === 'COMPLETED' ||
      this.order.orderStatus === 'CANCELLED') &&
      this.numberOfDaysAfterOrder < 120; //5 days
  }

  closeModal() {
    this.modalController.dismiss();
  }

  formatDeliveryAddress() {
    return this.order?.deliveryAddress?.addressDetails + ' #' + this.order?.deliveryAddress?.postalCode;
  }

  async editOrderDetail() {
    const modal = await this.modalController
      .create({
        component: EditOrderDetailModalComponent,
        componentProps: {
          order: this.order,
        },
      });

    modal.onDidDismiss()
      .then((data) => {
        if (data.data) {
          this.toastController.create({
            header: 'Successfully edited order',
            duration: 4000,
            position: 'top'
          }).then(x => x.present());
          this.order = data.data;
        }
      });

    return await modal.present();
  }

  canChangeOrderType(): boolean {
    return this.order.orderType === OrderTypeEnum.DELIVERY
      && !this.order.deliverer
      && (this.order.orderStatus !== OrderStatusEnum.CANCELLED && this.order.orderStatus !== OrderStatusEnum.REFUNDED && this.order.orderStatus !== OrderStatusEnum.COMPLETED);
  }

  changeDeliveryOrderType() {
    this.alertController.create({
      header: 'Change order to takeaway',
      message: 'We apologize for the long wait, but you can change the order to takeaway',
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            const temp: Order = _.cloneDeep(this.order);
            temp.orderType = OrderTypeEnum.TAKE_AWAY;
            this.orderService.changeDeliveryToTakeaway(temp).subscribe(
              updatedOrder => {
                this.order = updatedOrder;
              },
              error => {
                this.showAlert('Something went wrong, please try again later');
              }
            );
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(x => x.present());
  }

  cancelOrder() {
    this.alertController
      .create({
        message: 'Are you sure you want to cancel your order?',
        buttons: [
          {
            text: 'Yes',
            role: 'OK',
            handler: () => {
              this.orderService.cancelOrder(this.order).subscribe((cancelledOrder) => {
                this.order = cancelledOrder;
              });
            },
          },
          {
            text: 'No',
            role: 'cancel',
          },
        ],
      })
      .then((alertElement) => {
        alertElement.present();
      });
  }

  confirmOrder() {
    this.orderService
      .updateOrderStatus(this.order, OrderStatusEnum.COMPLETED)
      .subscribe((completedOrder) => {
        this.order = completedOrder;
      });
  }

  repeatOrder() {
    this.isRepeatingOrder = true;
    this.totalNumberOfItemsForRepeatOrder = this.getTotalOrderItems();
    this.currentNumberOfItems = 0;
    this.user = this.sessionService.getCurrentUser();
    const outletId = this.order.outlet._id;

    if (!this.isActive()) {
      this.showAlert('Sorry! Outlet is Closed!');
    } else {
      this.menuService.retrieveActiveMenuForOutlet(outletId).subscribe(
        (activeMenu) => {
          this.activeFoodItems = activeMenu.foodItems;
          this.activeFoodBundles = activeMenu.foodBundles;
          this.foodBasketService.activeMenu = activeMenu;

          this.order.individualOrderItems.forEach(orderItem => {
            if (_.find(this.activeFoodItems, { _id: orderItem.foodItem._id })) {
              this.showFoodItemModal(orderItem.foodItem);
            } else {
              this.totalNumberOfItemsForRepeatOrder -= 1;
              this.showAlert(
                'Food Item ' +
                orderItem.foodItem.itemName +
                ' is not available!'
              );
            }
          });

          this.order.foodBundleOrderItems.forEach(foodBundle => {
            const index = _.findIndex(this.activeFoodBundles, { _id: foodBundle.bundle_id });
            if (index !== -1) {
              this.showFoodBundleModal(this.activeFoodBundles[index]);
            } else {
              this.totalNumberOfItemsForRepeatOrder -= 1;
              this.showAlert(
                'Food Item ' +
                foodBundle.bundleName +
                ' is not available!'
              );
            }
          });
        },
        (error) => {
          this.alertController
            .create({
              header: 'Oops! Something Went Wrong!',
              message: error,
              buttons: [
                {
                  text: 'Go Back',
                  role: 'OK',
                  handler: () => {
                    this.router.navigate(['/customer/home']);
                  },
                },
              ],
            })
            .then((alertElement) => {
              alertElement.present();
            });
        }
      );
    }
  }

  isActive(): boolean {
    return this.outletService.checkOutletIsActive(this.order.outlet);
  }

  //FIXME: invalid navigation
  navigateToCart() {
    this.router.navigate(['/customer/activity/cart']);
  }

  checkEndOfRepeatOrder() {
    this.currentNumberOfItems += 1;
    if (this.currentNumberOfItems === this.totalNumberOfItemsForRepeatOrder) {
      this.dismissOrderDetailModal();
      if (this.foodBasketService.getTotalItems() > 0) {
        this.navigateToCart();
      }
    }
  }

  async showAlert(msg) {
    const alert = await this.alertController.create({
      message: msg,
      buttons: [
        {
          text: 'Okay',
          role: 'cancel',
        },
      ],
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
      },
    });

    modal.onDidDismiss().then(() => {
      this.checkEndOfRepeatOrder();
    });

    await modal.present();
  }

  async showFoodItemModal(foodItem: FoodItem) {
    if (foodItem.itemAvailability === false) {
      this.showAlert('Food item is not available!');
      return;
    }

    const modal = await this.modalController.create({
      component: FoodItemCustomizeModalComponent,
      componentProps: {
        foodItem: _.cloneDeep(foodItem),
        currentUser: this.user,
      },
    });

    modal.onDidDismiss().then(() => {
      this.checkEndOfRepeatOrder();
    });

    await modal.present();
  }

  getTotalOrderItems(): number {
    const foodBundleItems = this.order.foodBundleOrderItems
      ? this.order.foodBundleOrderItems.length
      : 0;
    const indiOrderItems = this.order.individualOrderItems
      ? this.order.individualOrderItems.length
      : 0;
    return foodBundleItems + indiOrderItems;
  }

  openReportModal() {
    this.modalController.create({
      component: CreateReportModalComponent,
      componentProps: {
        order: _.cloneDeep(this.order),
        accountType: this.user.accountType,
        // numberOfDaysAfterOrder: this.numberOfDaysAfterOrder,
      }
    }).then(x => x.present());
  }

  showUpdateDeliveryFeeAlert() {
    this.alertController.create({
      header: 'Update delivery fee',
      message: 'Pay more to increase likelihood of deliverers accepting your order!',
      inputs: [
        {
          type: 'number',
          value: undefined,
          placeholder: 'Enter new delivery fee'
        }
      ],
      buttons: [
        {
          text: 'Confirm',
          handler: (data) => {
            const newDeliveryFee = data[0] as number;
            if (newDeliveryFee < 1) {
              this.presentToast('Delivery fee has to be more than $1!');
              return;
            }
            this.alertController.create({
              header: 'Confirm new delivery fee',
              message: `Update delivery fee to $${newDeliveryFee}?`,
              buttons: [
                {
                  text: 'Confirm',
                  handler: () => {
                    this.orderService.updateDeliveryFeeForOrder(this.order._id, newDeliveryFee).subscribe(updatedOrder => {
                      this.order = updatedOrder;
                      this.presentToast('Successfully updated delivery fee');
                    });
                  }
                },
                {
                  text: 'Cancel',
                  role: 'cancel'
                }
              ]
            }).then(x => x.present());
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(x => x.present());
  }

  private presentToast(msg: string) {
    this.toastController.create({
      header: msg,
      duration: 4000,
      position: 'top'
    }).then(x => x.present());
  }

  private checkCanCancelOrder(): boolean {
    if (this.order.orderStatus === OrderStatusEnum.CANCELLED) {
      return false;
    }
    if (this.order.paymentType === PaymentTypeEnum.CASH && this.order.orderStatus !== OrderStatusEnum.UNPAID) {
      return false;
    }
    if (
      this.order.orderStatus !== OrderStatusEnum.UNPAID &&
      this.order.orderStatus !== OrderStatusEnum.PAID &&
      this.order.orderStatus !== OrderStatusEnum.RECEIVED
    ) {
      return false;
    }
    return true;
  }

}
