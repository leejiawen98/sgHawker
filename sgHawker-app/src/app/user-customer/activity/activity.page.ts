import { DeliveryOrderDetailsComponent } from './../../shared/delivery-order-details/delivery-order-details.component';
import { OrderStatusEnum } from './../../models/enums/order-status-enum.enum';
import { WebsocketService } from './../../services/websocket.service';
import { OnInit } from '@angular/core';
/* eslint-disable no-underscore-dangle */
import { Component } from '@angular/core';
import { User } from '../../models/user';
import { Order } from '../../models/order';
import { OrderService } from '../../services/order.service';
import { SessionService } from '../../services/session.service';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { Outlet } from 'src/app/models/outlet';
import { OrderDetailModalComponent } from 'src/app/shared/order-detail-modal/order-detail-modal.component';
import * as moment from 'moment';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit {

  ongoingOrders: Order[] = [];
  ongoingDeliveryRequests: Order[] = [];
  user: User;
  segmentModel: string;

  constructor(
    private orderService: OrderService,
    private sessionService: SessionService,
    private alertController: AlertController,
    private websocket: WebsocketService,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.ongoingOrders = [];
    this.ongoingDeliveryRequests = [];
    this.user = this.sessionService.getCurrentUser();
    this.segmentModel = 'ongoingOrders';

    this.websocket.onDeleteUnpaidCashOrderListener().subscribe(deletedOrder => {
      if (!this.isUserOrder(deletedOrder)) {
        return;
      }

      this.ongoingOrders = _.filter(this.ongoingOrders, order => order._id !== deletedOrder._id);

      this.toastController.create({
        header: 'Order for ' + deletedOrder.outlet.outletName + ' is deleted due to delayed payment',
        position: 'top',
        duration: 1000
      }).then(x => x.present());
    });

    this.websocket.onCancelOrderListener().subscribe(cancelledOrder => {
      if (!this.isUserOrder(cancelledOrder)) {
        return;
      }

      this.toastAlert(cancelledOrder);
      this.ongoingOrders = _.filter(this.ongoingOrders, order => order._id !== cancelledOrder._id);
    });

    this.websocket.onUpdateOrderStatusListener().subscribe(updatedOrder => {
      if (!this.isUserOrder(updatedOrder)) {
        return;
      }

      this.toastAlert(updatedOrder);

      if (updatedOrder.orderStatus === OrderStatusEnum.COMPLETED) {
        this.ongoingOrders = _.filter(this.ongoingOrders, order => order._id !== updatedOrder._id);
      } else {
        for (let index = 0; index < this.ongoingOrders.length; index++) {
          if (this.ongoingOrders[index]._id === updatedOrder._id) {
            this.ongoingOrders[index] = _.cloneDeep(updatedOrder);
          }
        }
      }
    });

    this.websocket.onUnableToFulfillOrderListener().subscribe(unfulfilledOrder => {
      if (!this.isUserOrder(unfulfilledOrder)) {
        return;
      }

      this.ongoingOrders = _.filter(this.ongoingOrders, order => order._id !== unfulfilledOrder._id);

      this.alertController.create({
        header: `Sorry! Your order at ${unfulfilledOrder.outlet.outletName} is cancelled`,
        message: `
          The hawker is unable to fulfill orders.
          For orders paid with digital payment, necessary refunds will be proceeded by the platform.
          For cash orders, please seek assistance from hawker.
        `,
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]
      }).then(x => x.present());
    });

    this.websocket.onDelivererUpdateListener().subscribe(updatedOrder => {
      if (!this.isUserOrder(updatedOrder)) {
        return;
      }

      let message;

      for (let index = 0; index < this.ongoingOrders.length; index++) {
        if (this.ongoingOrders[index]._id === updatedOrder._id) {
          if (!this.ongoingOrders[index].deliverer && updatedOrder.deliverer) {
            message = `New deliverer found for your order at ${updatedOrder.outlet.outletName}`;
          } else if (this.ongoingOrders[index].deliverer && !updatedOrder.deliverer) {
            message = `Deliverer has cancelled hitching for your order at ${updatedOrder.outlet.outletName}`;
          } else if (this.ongoingOrders[index].orderType !== updatedOrder.orderType) {
            message = `Successfully changed delivery order at ${updatedOrder.outlet.outletName} to takeaway`;
          }
          this.ongoingOrders[index] = _.cloneDeep(updatedOrder);
        }
      }

      this.toastController.create({
        header: message,
        position: 'top',
        duration: 1000
      }).then(x => x.present());
    });
  }

  ionViewWillEnter() {
    if (this.user) {
      this.orderService.findOngoingOrdersByCustomerId(this.user._id).subscribe(
        ongoingOrders => {
          this.ongoingOrders = ongoingOrders.sort(
            (orderA: Order, orderB: Order) => moment(orderA.orderCreationTime) > moment(orderB.orderCreationTime) ? -1 : 1);
        }
      );
    } else {
      const guestOrders = this.sessionService.getGuestOrderIds();
      if (guestOrders) {
        this.orderService.findOrdersByOrderId(guestOrders).subscribe(
          ongoingOrders => {
            this.ongoingOrders = ongoingOrders.sort(
              (orderA: Order, orderB: Order) => moment(orderA.orderCreationTime) > moment(orderB.orderCreationTime) ? -1 : 1);
          }
        );
      }
    }
  }

  toggleOrders() {
    if (this.segmentModel === 'ongoingOrders') {
      this.orderService.findOngoingOrdersByCustomerId(this.user._id).subscribe(
        ongoingOrders => {
          this.ongoingOrders = ongoingOrders.sort(
            (orderA: Order, orderB: Order) => moment(orderA.orderCreationTime) > moment(orderB.orderCreationTime) ? -1 : 1);
        }
      );
    } else if (this.segmentModel === 'ongoingDeliveries') {
      this.orderService.findOngoingDeliveryOrdersByDelivererId(this.user._id).subscribe(
        ongoingDeliveryRequests => {
          this.ongoingDeliveryRequests = ongoingDeliveryRequests.sort(
            (orderA: Order, orderB: Order) => moment(orderA.orderPickUpTime) > moment(orderB.orderPickUpTime) ? -1 : 1);
        }
      );
    }
  }

  showOrderDetails(order: Order) {
    this.modalController.create({
      component: OrderDetailModalComponent,
      componentProps: {
        order
      }
    }).then(x => x.present());
  }

  showDeliveryOrderDetails(order: Order) {
    this.modalController.create({
      component: DeliveryOrderDetailsComponent,
      componentProps: {
        order
      }
    }).then(x => x.present());
  }

  private async toastAlert(updatedOrder: Order) {
    const message = this.toastMessage(updatedOrder.outlet, updatedOrder);
    if (!message) {
      return;
    }
    this.toastController.create({
      header: message,
      position: 'top',
      duration: 1000
    }).then(x => x.present());
  }

  private toastMessage(outlet: Outlet, updatedOrder: Order): string {
    switch (updatedOrder.orderStatus) {
      case OrderStatusEnum.PAID:
        return `You have made payment for your order at ${outlet.outletName}!`;
      case OrderStatusEnum.CANCELLED:
        return `Your order at ${outlet.outletName} is cancelled!`;
      case OrderStatusEnum.RECEIVED:
        return `${outlet.outletName} has received your order!`;
      case OrderStatusEnum.PREPARING:
        return `${outlet.outletName} is now preparing your order!`;
      case OrderStatusEnum.READY:
        return `Your order at ${outlet.outletName} is ready for collection!`;
      case OrderStatusEnum.COMPLETED:
        return `Enjoy your meal!`;
      case OrderStatusEnum.PICKED_UP:
        return `Your deliverer has picked up the order at ${outlet.outletName}!`;
      case OrderStatusEnum.ON_THE_WAY:
        return `Your deliverer is on the way!`;
      case OrderStatusEnum.DELIVERED:
        return `Your deliverer has delivered the order for ${outlet.outletName}!`;
      default:
        break;
    }
  }

  private isUserOrder(order: Order): boolean {
    if (this.user) {
      return order.customer._id === this.user._id;
    } else {
      return this.sessionService.getGuestOrderIds().includes(order._id);
    }
  }

}
