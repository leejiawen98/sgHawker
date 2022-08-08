import { DeliveryOrderDetailsComponent } from './../../../shared/delivery-order-details/delivery-order-details.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Order } from 'src/app/models/order';
import { DeliveryHawkerCenter } from 'src/app/models/submodels/deliveryHawkerCenter';
import { OrderService } from 'src/app/services/order.service';
import { RecommendDeliveryOrderService } from 'src/app/services/recommend-delivery-order.service';
import { AllRecommendedDeliveryModalComponent } from '../recommended-delivery/all-recommended-delivery-modal/all-recommended-delivery-modal.component';
import * as _ from 'lodash';
import { WebsocketService } from 'src/app/services/websocket.service';
@Component({
  selector: 'app-hawker-center-delivery-orders',
  templateUrl: './hawker-center-delivery-orders.page.html',
  styleUrls: ['./hawker-center-delivery-orders.page.scss'],
})
export class HawkerCenterDeliveryOrdersPage implements OnInit {

  hawkerCenterName: string;
  deliveryHawkerCenter: DeliveryHawkerCenter;

  allOrdersByHawkerCenter: Order[];
  recommendedOrders: Order[];
  outletMap: any[];
  tempOutletMap: any[];

  showFilterOptions: boolean;
  priceRangeValue: any;
  allCuisines: string[];
  selectedCuisines: string[];
  input: string;
  filterApplied: boolean;
  noSearchResults: boolean;
  noFilterResults: boolean;

  allSortCategories: string[];
  selectedSortCategory: string;

  constructor(
    private orderService: OrderService,
    private recommendationService: RecommendDeliveryOrderService,
    private route: ActivatedRoute,
    private modalController: ModalController,
    private websocket: WebsocketService,
  ) { }

  ngOnInit() {
    this.websocket.onDelivererUpdateListener().subscribe(updatedOrder => {
      let existingOrder = false;
      for (let i = 0; !existingOrder && i < this.outletMap.length; i++) {
        for (let j = 0; !existingOrder && j < this.outletMap[i].value.length; j++) {
          const order = this.outletMap[i].value[j];
          if (order._id === updatedOrder._id) {
            if ((!order.deliverer && updatedOrder.deliverer) ||
              order.orderType !== updatedOrder.orderType) {
              this.outletMap[i].value.splice(j, 1);
              if (this.outletMap[i].value.length === 0) {
                this.outletMap.splice(i, 1);
              }
              existingOrder = true;
            }
          }
        }
      }
      if (!existingOrder) {
        let hasCurrentOutlet = false;
        this.outletMap = this.outletMap.map(outlet => {
          if (outlet.name === updatedOrder.outlet.outletName) {
            hasCurrentOutlet = true;
            const orders = outlet.value;
            orders.push(updatedOrder);
            return { ...outlet, value: orders };
          } else {
            return outlet;
          }
        });
        if (!hasCurrentOutlet) {
          if (this.outletMap === undefined) {
            this.outletMap = [];
          }
          this.outletMap.push({
            name: updatedOrder.outlet.outletName,
            value: [updatedOrder]
          });
        }
      }
    });
  }

  ionViewWillEnter() {
    this.hawkerCenterName = this.route.snapshot.params['hawkerCenterName'];
    this.orderService.findAllDeliveryOrders().subscribe(hawkerCenters => {
      this.deliveryHawkerCenter = hawkerCenters.filter(center => center.hawkerCenterName === this.hawkerCenterName)[0];
      this.orderService.findAllDeliveryOrdersByHawkerCenter(this.hawkerCenterName).subscribe(orders => {
        this.allOrdersByHawkerCenter = orders;

        let map = new Map();
        // this.outletMap = new Map();
        this.allOrdersByHawkerCenter.forEach(order => {
          if (map.get(order.outlet.outletName)) {
            map.get(order.outlet.outletName).push(order);
          } else {
            const orderArr = [];
            orderArr.push(order);
            map.set(order.outlet.outletName, orderArr);
          }
        })
        this.outletMap = [...map].map(([name, value]) => ({ name, value }));
        this.tempOutletMap = [...this.outletMap];
      })
      if (!this.recommendationService.recommendedOrders) {
        this.recommendationService.generateAllRecommendations(hawkerCenters);
      }
      this.recommendedOrders = this.recommendationService.generateRecommendationsForHawkerCenter(this.hawkerCenterName);

      this.allCuisines = [];
      this.deliveryHawkerCenter.cuisineTypes.forEach(cuisine => {
        if (!this.allCuisines.includes(cuisine)) {
          this.allCuisines.push(cuisine);
        }
      });
    });

    this.showFilterOptions = false;
    this.initFilterOptions();
    this.allSortCategories = [
      'Outlet Name, Ascending order',
      'Outlet Name, Descending order',
      'Delivery Fee, Ascending order',
      'Delivery Fee, Descending order'
    ];
    // this.selectedSortCategory = 'Outlet Name, Ascending order'
  }

  initFilterOptions() {
    this.noFilterResults = false;
    this.noSearchResults = false;
    this.filterApplied = false;
    this.priceRangeValue = {
      lower: 0,
      upper: 5
    }
    this.selectedCuisines = [];
  }

  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;
  }

  applyFilter() {
    this.filterApplied = true;
    this.outletMap = this.filterCategory(this.tempOutletMap);
    this.toggleFilterOptions();
    if (this.outletMap.length === 0) {
      this.noFilterResults = true;
    } else {
      this.noFilterResults = false;
    }
  }

  searchData(event) {
    if (this.filterApplied) {
      this.outletMap = this.filterCategory(this.tempOutletMap);
    } else {
      this.outletMap = this.tempOutletMap;
    }

    this.input = event.target.value.toLowerCase();
    this.outletMap = _.filter(this.outletMap, order => order.name.toLowerCase().includes(this.input));
    if (this.outletMap.length === 0) {
      this.noSearchResults = true;
    } else {
      this.noSearchResults = false;
    }
  }

  sortList() {
    // 'Outlet Name, Ascending order',
    // 'Outlet Name, Descending order',
    // 'Delivery Fee, Ascending order',
    // 'Delivery Fee, Descending order'
    switch (this.selectedSortCategory) {
      case ('Outlet Name, Ascending order'):
        this.outletMap = this.outletMap.sort((a, b) => a.name <= b.name ? -1 : 1);
        break;
      case ('Outlet Name, Descending order'):
        this.outletMap = this.outletMap.sort((a, b) => a.name <= b.name ? 1 : -1);
        break;
      case ('Delivery Fee, Ascending order'):
        this.outletMap = this.outletMap.map(outlet => {
          let orders = outlet.value;
          orders.sort((a, b) => a.deliveryFee - b.deliveryFee);
          return { ...outlet, value: orders };
        });
        break;
      case ('Delivery Fee, Descending order'):
        this.outletMap = this.outletMap.map(outlet => {
          let orders = outlet.value;
          orders.sort((a, b) => b.deliveryFee - a.deliveryFee);
          return { ...outlet, value: orders };
        });
        break;
      default:
        break;
    }
  }

  private filterCategory(source) {
    //user did not select any cuisine => wants to view all cuisines
    const allCuisinesSelected = this.selectedCuisines.length === 0;
    //minimum price: if the user sets lower price to 0, only need to find orders lower than the upper price
    const minimumPrice = this.priceRangeValue.lower === 0;
    //maximum price: if the user sets higher price to 5, only need to find orders higher than the lower price
    const maximumPrice = this.priceRangeValue.upper === 5;

    if (allCuisinesSelected && minimumPrice && maximumPrice) {
      return source;
    }

    let result = _.cloneDeep(source);

    if (!allCuisinesSelected) {
      result = result.filter(outlet => {
        let hasCuisine = false;
        outlet.value[0].outlet.cuisineType.forEach(type => {
          if (this.selectedCuisines.includes(type)) {
            hasCuisine = true;
          }
        });
        return hasCuisine;
      });
    }

    if (minimumPrice) {
      result = result.map(outlet => {
        const filteredResult = outlet.value.filter(order => {
          return order.deliveryFee <= this.priceRangeValue.upper;
        });
        return { ...outlet, value: filteredResult };
      });
      result = result.filter(outlet => outlet.value && outlet.value.length > 0);
    } else if (maximumPrice) {
      result = result.map(outlet => {
        const filteredResult = outlet.value.filter(order => {
          return order.deliveryFee >= this.priceRangeValue.lower;
        });
        return { ...outlet, value: filteredResult };
      });
      result = result.filter(outlet => outlet.value && outlet.value.length > 0);
    } else {
      result = result.map(outlet => {
        const filteredResult = outlet.value.filter(order => {
          return order.deliveryFee >= this.priceRangeValue.lower &&
            order.deliveryFee <= this.priceRangeValue.upper;;
        });
        return { ...outlet, value: filteredResult };
      });
      result = result.filter(outlet => outlet.value && outlet.value.length > 0);
    }
    return result;
  }

  async showAllRecommended() {
    const modal = await this.modalController.create({
      component: AllRecommendedDeliveryModalComponent,
      componentProps: {
        allRecommendedOrdersForHawkerCenter: this.recommendedOrders
      }
    });
    await modal.present();
  }

  async openDeliveryOrderDetails(order: Order) {
    await this.modalController.create({
      component: DeliveryOrderDetailsComponent,
      componentProps: {
        order
      }
    }).then(x => x.present());
  }

}
