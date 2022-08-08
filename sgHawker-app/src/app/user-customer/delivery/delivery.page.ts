import { DeliveryOrderDetailsComponent } from './../../shared/delivery-order-details/delivery-order-details.component';
import { DeliveryHawkerCenter } from './../../models/submodels/deliveryHawkerCenter';
import { RecommendDeliveryOrderService } from './../../services/recommend-delivery-order.service';
import { OrderService } from 'src/app/services/order.service';
import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import * as _ from 'lodash';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AllRecommendedDeliveryModalComponent } from './recommended-delivery/all-recommended-delivery-modal/all-recommended-delivery-modal.component';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.page.html',
  styleUrls: ['./delivery.page.scss'],
})
export class DeliveryPage implements OnInit {

  deliveryHawkerCenters: DeliveryHawkerCenter[];
  tempDeliveryHawkerCenters: DeliveryHawkerCenter[];
  input: string;

  allCategories: string[];
  selectedCategories: string[];
  noSearchResults: boolean;
  noFilterResults: boolean;

  allSortCategories: string[];
  selectedSortCategory: string;

  recommendedDeliveryOrders: Order[];

  constructor(
    private router: Router,
    private orderService: OrderService,
    private recommendationService: RecommendDeliveryOrderService,
    private modalController: ModalController,
  ) { }

  ngOnInit(): void {
  }

  ionViewWillEnter() {
    this.orderService.findAllDeliveryOrders().subscribe((deliveryHawkerCenters) => {
      this.deliveryHawkerCenters = deliveryHawkerCenters;
      this.tempDeliveryHawkerCenters = deliveryHawkerCenters;

      this.recommendedDeliveryOrders = this.recommendationService.generateAllRecommendations(this.deliveryHawkerCenters);

      const tempSet = new Set();
      _.forEach(deliveryHawkerCenters, hawkerCenter => {
        _.forEach(hawkerCenter.cuisineTypes, type => {
          tempSet.add(type);
        });
      });
      this.allCategories = Array.from(tempSet) as string[];
    });

    this.allSortCategories = [
      'Hawker Center Name, Ascending',
      'Hawker Center Name, Descending',
      'Number of orders, Ascending',
      'Number of orders, Descending'
    ];

    this.noSearchResults = false;
    this.noFilterResults = false;
  }

  filterCategories() {
    if (!this.selectedCategories || this.selectedCategories.length <= 0) {
      this.deliveryHawkerCenters = this.tempDeliveryHawkerCenters;
      return;
    }
    this.deliveryHawkerCenters = this.filterCategory(this.tempDeliveryHawkerCenters);
    if (this.deliveryHawkerCenters.length === 0) {
      this.noFilterResults = true;
    } else {
      this.noFilterResults = false;
    }
  }

  searchData(event) {
    this.deliveryHawkerCenters = this.filterCategory(this.tempDeliveryHawkerCenters);

    this.input = event.target.value.toLowerCase();
    this.deliveryHawkerCenters = _.filter(this.deliveryHawkerCenters, center => center.hawkerCenterName.toLowerCase().includes(this.input));
    if (this.deliveryHawkerCenters.length === 0) {
      this.noSearchResults = true;
    } else {
      this.noSearchResults = false;
    }
  }

  sortList() {
    // 'Hawker Center Name, Ascending order',
    // 'Hawker Center Name, Descending order',
    // 'Number of orders, Ascending order',
    // 'Number of orders, Descending order'
    switch (this.selectedSortCategory) {
      case ('Hawker Center Name, Ascending'):
        this.deliveryHawkerCenters = this.deliveryHawkerCenters.sort((a, b) => {
          return a.hawkerCenterName<= b.hawkerCenterName ? -1 : 1;
        });
        break;
      case ('Hawker Center Name, Descending'):
        this.deliveryHawkerCenters = this.deliveryHawkerCenters.sort((a, b) => {
          return b.hawkerCenterName <= a.hawkerCenterName ? -1 : 1;
        });
        break;
      case ('Number of orders, Ascending'):
        this.deliveryHawkerCenters = this.deliveryHawkerCenters.sort((a, b) => {
          return a.orders.length - b.orders.length;
        });
        break;
      case ('Number of orders, Descending'):
        this.deliveryHawkerCenters = this.deliveryHawkerCenters.sort((a, b) => {
          return b.orders.length - a.orders.length;
        });
        break;
      default:
        break;
    }
  }

  async showAllRecommended() {
    const modal = await this.modalController.create({
      component: AllRecommendedDeliveryModalComponent,
      componentProps: {
        allRecommendedOrdersByHawkerCenters: this.recommendedDeliveryOrders
      }
    });
    await modal.present();
  }

  navigateToHawkerCenter(hawkerCenter: DeliveryHawkerCenter) {
    this.router.navigate([`/customer/delivery/hawker-center-delivery-orders/${hawkerCenter.hawkerCenterName}`]);
  }

  async openDeliveryOrderDetails(order: Order) {
    await this.modalController.create({
      component: DeliveryOrderDetailsComponent,
      componentProps: {
        order
      }
    }).then(x => x.present());
  }


  private filterCategory(source: DeliveryHawkerCenter[]) {
    if (!this.selectedCategories || this.selectedCategories.length === 0) {
      return source;
    }
    return _.filter(source, centre => {
      let hasCategory = false;
      _.forEach(centre.cuisineTypes, type => {
        if (this.selectedCategories.includes(type)) {
          hasCategory = true;
        }
      });
      return hasCategory;
    });
  }
}
