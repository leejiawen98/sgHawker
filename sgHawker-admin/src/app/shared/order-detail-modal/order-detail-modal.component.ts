/* eslint-disable no-underscore-dangle */
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-order-detail-modal',
  templateUrl: './order-detail-modal.component.html',
  styleUrls: ['./order-detail-modal.component.scss'],
})
export class OrderDetailModalComponent implements OnInit {

  @Input() order: Order;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getTotalOrderItems(): number {
    const foodBundleItems = this.order.foodBundleOrderItems ? this.order.foodBundleOrderItems.length : 0;
    const indiOrderItems = this.order.individualOrderItems ? this.order.individualOrderItems.length : 0;
    return foodBundleItems + indiOrderItems;
  }

}
