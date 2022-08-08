import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Order } from 'src/app/models/order';
import { DeliveryHawkerCenter } from 'src/app/models/submodels/deliveryHawkerCenter';
import { DeliveryOrderDetailsComponent } from 'src/app/shared/delivery-order-details/delivery-order-details.component';

@Component({
  selector: 'app-all-recommended-delivery-modal',
  templateUrl: './all-recommended-delivery-modal.component.html',
  styleUrls: ['./all-recommended-delivery-modal.component.scss'],
})
export class AllRecommendedDeliveryModalComponent implements OnInit {

  @Input() allRecommendedOrdersByHawkerCenters: Order[];
  @Input() allRecommendedOrdersForHawkerCenter: Order[];

  hawkerCenterMap: Map<string, DeliveryHawkerCenter[]>;
  outletMap: Map<string, Order[]>;
  
  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.outletMap = new Map();
    if (this.allRecommendedOrdersByHawkerCenters) {
      this.allRecommendedOrdersByHawkerCenters.forEach(order => {
        if (this.outletMap.get(order.outlet.hawkerCentreName)) {
          this.outletMap.get(order.outlet.hawkerCentreName).push(order);
        } else {
          const orderArr = [];
          orderArr.push(order);
          this.outletMap.set(order.outlet.hawkerCentreName, orderArr);
        }
      })
    } else if (this.allRecommendedOrdersForHawkerCenter) {
      this.allRecommendedOrdersForHawkerCenter.forEach(order => {
        if (this.outletMap.get(order.outlet.outletName)) {
          this.outletMap.get(order.outlet.outletName).push(order);
        } else {
          const orderArr = [];
          orderArr.push(order);
          this.outletMap.set(order.outlet.outletName, orderArr);
        }
      })
    }
  }

  getOrderSize(order: Order): number {
    return order.individualOrderItems?.length + order.foodBundleOrderItems?.length;
  }

  async openDeliveryOrderDetails(order: Order) {
    await this.modalController.create({
      component: DeliveryOrderDetailsComponent,
      componentProps: {
        order
      }
    }).then(x => x.present());
  }

  dismissModal() {
    this.modalController.dismiss();
  }

}
