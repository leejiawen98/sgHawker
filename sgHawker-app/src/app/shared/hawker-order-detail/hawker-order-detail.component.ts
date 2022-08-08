import { SessionService } from './../../services/session.service';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { CreateReportModalComponent } from '../create-report-modal/create-report-modal.component';
import * as _ from 'lodash';
import { User } from 'src/app/models/user';
import * as moment from 'moment';

@Component({
  selector: 'app-hawker-order-detail',
  templateUrl: './hawker-order-detail.component.html',
  styleUrls: ['./hawker-order-detail.component.scss'],
})
export class HawkerOrderDetailComponent implements OnInit {

  @Input() order: Order;

  user: User;
  numberOfDaysAfterOrder: number;
  canReport: boolean;

  constructor(
    private modalController: ModalController,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.numberOfDaysAfterOrder = Math.abs(moment.duration(moment(this.order.completedTime).diff(moment(new Date()))).asDays());

    this.canReport = (this.order.orderStatus === 'COMPLETED' ||
      this.order.orderStatus === 'CANCELLED') &&
      this.numberOfDaysAfterOrder < 5;
  }

  closeModal() {
    this.modalController.dismiss();
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

}
