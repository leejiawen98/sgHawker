/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
import { OrderService } from '../../../services/order.service';
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Order } from '../../../models/order';
import * as _ from 'lodash';
import { SessionService } from '../../../services/session.service';
import { AlertController, ModalController } from '@ionic/angular';
import { User } from '../../../models/user';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { OrderDetailModalComponent } from 'src/app/shared/order-detail-modal/order-detail-modal.component';
import * as moment from 'moment';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { DeliveryOrderDetailsComponent } from 'src/app/shared/delivery-order-details/delivery-order-details.component';

@Component({
  selector: 'app-activity-history',
  templateUrl: './activity-history.page.html',
  styleUrls: ['./activity-history.page.scss'],
})
export class ActivityHistoryPage implements OnInit {

  @ViewChild('filterDetails') filterDetails: any;

  segmentModel: string;
  user: User;

  orders: Order[];
  tempOrders: Order[];

  allOutlets: string[];
  selectedOutlets: string[];

  filterStartDate: Date;
  filterEndDate: Date;

  expanded = false;

  constructor(
    private renderer: Renderer2,
    private orderService: OrderService,
    private sessionService: SessionService,
    private alertController: AlertController,
    private location: Location,
    private router: Router,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.segmentModel = 'orders';
    this.orders = [];
    this.tempOrders = [];
    this.allOutlets = [];
    this.selectedOutlets = [];
  }

  ionViewWillEnter() {
    this.segmentModel = 'orders';
    this.orderService.findCompletedOrdersByCustomerId(this.user._id).subscribe(
      completedOrders => {
        this.orders = completedOrders.sort(
          (orderA: Order, orderB: Order) => moment(orderA.orderCreationTime) > moment(orderB.orderCreationTime) ? -1 : 1);
        this.tempOrders = _.cloneDeep(this.orders);
        const temp = new Set(this.orders.map(x => x.outlet.outletName));
        this.allOutlets = [...temp];
      },
      error => {
        this.initAlert();
      });

    this.renderer.setStyle(this.filterDetails, 'max-height', '0px');
    this.renderer.setStyle(this.filterDetails, 'padding', '0px 16px');
  }

  toggleAccordion() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.renderer.setStyle(this.filterDetails, 'max-height', '500px');
    } else {
      this.renderer.setStyle(this.filterDetails, 'max-height', '0px');
    }
  }

  toggleSegment() {
    if (this.segmentModel === 'orders') {
      this.orderService.findCompletedOrdersByCustomerId(this.user._id).subscribe(
        completedOrders => {
          this.orders = completedOrders.sort(
            (orderA: Order, orderB: Order) => moment(orderA.orderCreationTime) > moment(orderB.orderCreationTime) ? -1 : 1);

          this.tempOrders = _.cloneDeep(this.orders);
          const temp = new Set(this.orders.map(x => x.outlet.outletName));
          this.allOutlets = [...temp];
        },
        error => {
          this.initAlert();
        });
    } else {
      this.orderService.findCompletedDeliveryOrdersByDelivererId(this.user._id).subscribe(
        deliveryOrders => {
          this.orders = deliveryOrders.sort(
            (orderA: Order, orderB: Order) => moment(orderA.orderCreationTime) > moment(orderB.orderCreationTime) ? -1 : 1);
          this.tempOrders = _.cloneDeep(this.orders);
          const temp = new Set(this.orders.map(x => x.outlet.outletName));
          this.allOutlets = [...temp];
        },
        error => {
          this.initAlert();
        });
    }
  }

  showDeliveryOrderDetails(order: Order) {
    this.modalController.create({
      component: DeliveryOrderDetailsComponent,
      componentProps: {
        order
      }
    }).then(x => x.present());
  }

  filter() {
    if ((this.filterStartDate && !this.filterEndDate)
      || (this.filterEndDate && !this.filterStartDate)
      || moment(this.filterEndDate).isBefore(moment(this.filterStartDate))
    ) {
      this.alertController.create({
        header: 'Invalid time range',
        buttons: [
          {
            text: 'Okay',
            role: 'cancel'
          }
        ]
      }).then(x => x.present());
      return;
    }

    this.orders = this.tempOrders.filter(order => {
      let valid = true;

      // if filtering date
      if (this.filterStartDate &&
        !moment(order.orderCreationTime).isBetween(moment(this.filterStartDate), moment(this.filterEndDate), 'day', '[]')) {
        valid = false;
      }

      // if filtering outlet
      if (this.selectedOutlets.length > 0 &&
        !this.selectedOutlets.includes(order.outlet.outletName)
      ) {
        valid = false;
      }

      return valid;
    });
  }

  resetFilter() {
    this.orders = _.cloneDeep(this.tempOrders);
    this.filterStartDate = null;
    this.filterEndDate = null;
    this.selectedOutlets = [];
  }

  async showOrderDetails(order: Order) {
    const dismissOrderDetailModal = () => {
      modal.dismiss();
    };

    const modal = await this.modalController.create({
      component: OrderDetailModalComponent,
      componentProps: {
        order,
        dismissOrderDetailModal,
      }
    });
    return await modal.present();
  }

  redirectToOngoingOrders() {
    this.router.navigate(['customer/activity']);
  }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }

  private initAlert() {
    this.alertController.create({
      header: 'Something went wrong!',
      message: 'Unable to retrieve orders',
      buttons: [
        {
          text: 'Go back',
          handler: () => {
            this.location.back();
          }
        }
      ]
    }).then(x => x.present());
  }
}
