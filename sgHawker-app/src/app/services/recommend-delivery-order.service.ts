import { DeliveryHawkerCenter } from './../models/submodels/deliveryHawkerCenter';
import { SessionService } from './session.service';
import { OrderService } from 'src/app/services/order.service';
import { Injectable } from '@angular/core';
import { Order } from '../models/order';
import { User } from '../models/user';
import * as moment from 'moment';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class RecommendDeliveryOrderService {

  user: User;
  ongoingOrders: Order[];
  completedOrders: Order[];
  allDeliveryOrders: Order[];
  recommendedOrders: Order[];

  constructor(
    private orderService: OrderService,
    private sessionService: SessionService
  ) {
    this.user = this.sessionService.getCurrentUser();

    this.orderService
      .findOngoingOrdersByCustomerId(this.user._id)
      .subscribe((ongoingOrders) => {
        this.ongoingOrders = ongoingOrders;

        this.orderService.findCompletedOrdersByCustomerId(this.user._id)
          .subscribe((completedOrders) => {
            this.allDeliveryOrders = completedOrders;
          });
      });
  }

  generateAllRecommendations(deliveryHawkerCenters: DeliveryHawkerCenter[]): Order[] {
    if (this.ongoingOrders?.length > 0) {
      return this.generateRecommendations(deliveryHawkerCenters, 'ONGOING');
    }

    if (this.completedOrders?.length > 0) {
      return this.generateRecommendations(deliveryHawkerCenters, 'COMPLETED');
    }

    return this.generateRandomRecommendations(deliveryHawkerCenters);
  }

  generateRecommendationsForHawkerCenter(hawkerCenterName: string): Order[] {
    if (this.recommendedOrders) {
      return this
      .recommendedOrders
      .filter(order => order.outlet.hawkerCentreName.toLowerCase().replace(' ', '') === hawkerCenterName.toLowerCase().replace(' ', ''));
    }
    
  }

  private generateRecommendations(deliveryHawkerCenters: DeliveryHawkerCenter[], compareBy: string): Order[] {
    const matchingOrders: Order[] = [];
    let sourceOrders: Order[] = [];

    switch (compareBy) {
      case 'ONGOING':
        sourceOrders = this.ongoingOrders;
        break;
      case 'COMPLETED':
        sourceOrders = this.completedOrders;
        break;
      default:
        break;
    }

    const hawkerCenterNames: Set<string> = new Set(sourceOrders.map(order => order.outlet.hawkerCentreName.toLowerCase().replace(' ', '')));

    for (const hawkerCenter of deliveryHawkerCenters) {
      if (hawkerCenterNames.has(hawkerCenter.hawkerCenterName.toLowerCase().replace(' ', ''))) {
        matchingOrders.push(...hawkerCenter.orders);
      } else {
        continue;
      }
    }

    for (const order of sourceOrders) {
      for (const delivery of matchingOrders) {
        this.generateSimilarityScore(order, delivery);
      }
    }

    matchingOrders.sort((a, b) => a.similarityScore - b.similarityScore);

    this.recommendedOrders = matchingOrders;

    return matchingOrders;
  }

  private generateSimilarityScore(sourceOrder: Order, deliveryOrder: Order) {
    let score = 0;

    const orderPickUpTime = moment(deliveryOrder.orderPickUpTime);
    const orderCreationTime = moment(sourceOrder.orderCreationTime);

    // order pick up time is before the order creation time
    if (orderPickUpTime.isBefore(orderCreationTime)) {
      score += 10;
    } else if (orderPickUpTime.isBefore(orderCreationTime.add(30, 'minutes'))) {
      // within 30 mins of the order creation time, the later the timing, the lower the score
      score += (10 + (- (orderCreationTime.diff(orderPickUpTime, 'minute', false) / 100)));
    }

    if (sourceOrder.outlet.outletName.toLowerCase().replace(' ', '') === deliveryOrder.outlet.outletName.toLowerCase().replace(' ', '')) {
      score += 5;
    }

    const profit = deliveryOrder.deliveryFee - deliveryOrder.deliveryCommission;

    score += (profit % 5);

    if (deliveryOrder.similarityScore === undefined || score > deliveryOrder.similarityScore) {
      deliveryOrder.similarityScore = score;
    }
  }

  private generateRandomRecommendations(deliveryHawkerCenters: DeliveryHawkerCenter[]) {
    const orders: Order[] = [];

    for (const centre of deliveryHawkerCenters) {
      orders.push(...centre.orders);
    }

    orders.sort((a, b) => moment(a.orderPickUpTime).diff(moment(b.orderPickUpTime), 'minutes'));

    return orders.slice(0, 10);
  }

}
