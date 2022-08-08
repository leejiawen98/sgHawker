/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { OrderStatusEnum } from 'src/app/models/enums/order-status-enum.enum';
import { OrderTypeEnum } from 'src/app/models/enums/order-type-enum.enum';
import { Order } from 'src/app/models/order';
import { User } from 'src/app/models/user';
import { OrderService } from 'src/app/services/order.service';
import { SessionService } from 'src/app/services/session.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { CreateReportModalComponent } from '../create-report-modal/create-report-modal.component';

@Component({
  selector: 'app-delivery-order-details',
  templateUrl: './delivery-order-details.component.html',
  styleUrls: ['./delivery-order-details.component.scss'],
})
export class DeliveryOrderDetailsComponent implements OnInit {

  @Input() order: Order;
  user: User;

  baseUrl = '/api';
  nextOrderStatus: OrderStatusEnum;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private orderService: OrderService,
    private websocket: WebsocketService,
    private sessionService: SessionService,
    private toastController: ToastController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.websocket.onUpdateOrderStatusListener().subscribe((updatedOrder) => {
      if (updatedOrder._id === this.order._id) {
        this.order = updatedOrder;
      }
    });

    this.user = this.sessionService.getCurrentUser();
    this.updateNextStatus();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  formatDeliveryAddress() {
    return this.order.deliveryAddress.addressDetails + ' #' + this.order.deliveryAddress.postalCode;
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

  canAcceptDeliveryOrder() {
    return this.order.orderType === OrderTypeEnum.DELIVERY
      && this.order.deliverer === undefined
      && this.order.customer._id !== this.user._id;
  }

  canCancelDeliveryOrder() {
    if (this.order.orderType !== OrderTypeEnum.DELIVERY
      || this.order.deliverer?._id !== this.user._id
    ) {
      return false;
    }

    switch (this.order.orderStatus) {
      case OrderStatusEnum.PICKED_UP:
      case OrderStatusEnum.ON_THE_WAY:
      case OrderStatusEnum.DELIVERED:
      case OrderStatusEnum.COMPLETED:
        return false;
      default:
        break;
    }

    if (moment().isAfter(moment(this.order.orderPickUpTime).subtract(15, 'minutes'))) {
      return false;
    }

    return true;
  }

  updateNextStatus() {
    if (!this.order.deliverer || this.order.deliverer._id !== this.user._id) {
      return null;
    }

    switch (this.order.orderStatus) {
      case OrderStatusEnum.READY:
        this.nextOrderStatus = OrderStatusEnum.PICKED_UP;
        break;
      case OrderStatusEnum.PICKED_UP:
        this.nextOrderStatus = OrderStatusEnum.ON_THE_WAY;
        break;
      case OrderStatusEnum.ON_THE_WAY:
        this.nextOrderStatus = OrderStatusEnum.DELIVERED;
        break;
      default:
        this.nextOrderStatus = undefined;
    }
  }

  updateOrderStatus() {
    if (this.nextOrderStatus === undefined) {
      return;
    }

    this.orderService.updateOrderStatus(this.order, this.nextOrderStatus).subscribe(updatedOrder => {
      this.order = updatedOrder;
      this.updateNextStatus();
      this.toastController.create({
        header: `Updated delivery status to ${this.order.orderStatus.split('_').join(' ')}`,
        position: 'top',
        duration: 4000,
      }).then(x => x.present());
    });
  }

  cancelDeliveryForOrder() {
    this.alertController.create({
      header: 'Confirm cancel delivery?',
      message: `You could earn $${(this.order.deliveryFee - this.order.deliveryCommission).toFixed(2)} from this delivery order!`,
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.orderService.updateDelivererForOrder(this.order._id, null).subscribe(
              updatedOrder => {
                this.order = updatedOrder;
                this.toastController.create({
                  header: 'Delivery successfully cancelled',
                  position: 'top',
                  duration: 4000,
                }).then(x => x.present());
                this.router.navigateByUrl('customer/activity');
              },
              error => {
                this.toastController.create({
                  header: 'Unable to cancel delivery',
                  position: 'top',
                  duration: 4000,
                  message: `Please try again later`,
                }).then(x => x.present());
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

  acceptDelivery() {
    this.alertController.create({
      header: 'Confirm accept delivery?',
      message: `Not fulfilling the delivery can result in you bearing the full cost of the order`,
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.orderService.updateDelivererForOrder(this.order._id, this.user._id).subscribe(
              (updatedOrder) => {
                this.order = updatedOrder;
                this.toastController.create({
                  header: 'Successfully accepted delivery order',
                  position: 'top',
                  duration: 4000,
                  message: `Please proceed to pick up the order at the stipulated place and time`
                }).then(x => x.present());
              },
              error => {
                this.toastController.create({
                  header: 'Unable to accept delivery order',
                  position: 'top',
                  duration: 4000,
                  message: `Please try again later`,
                }).then(x => x.present());
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

  openReportModal() {
    this.modalController.create({
      component: CreateReportModalComponent,
      componentProps: {
        order: this.order,
        accountType: this.user.accountType,
        // numberOfDaysAfterOrder: 0,
      }
    }).then(x => x.present());
  }

}
