/* eslint-disable guard-for-in */
import { Component, OnInit } from '@angular/core';
import { Order } from '../../../models/order';
import { Outlet } from '../../../models/outlet';
import { OrderService } from '../../../services/order.service';
import { OutletService } from '../../../services/outlet.service';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';
import * as _ from "lodash";
import * as moment from 'moment';
import { AlertController, ModalController } from '@ionic/angular';
import { EChartsOption } from 'echarts';
import { HawkerCenter } from 'src/app/models/submodels/hawkerCenter';
import { Observable, of, forkJoin } from 'rxjs';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-delivery-demand',
  templateUrl: './delivery-demand.component.html',
  styleUrls: ['./delivery-demand.component.scss'],
})
export class DeliveryDemandComponent implements OnInit {

  segmentModel: string;
  tempModel: string;
  allOrders: Order[];
  allOutlets: Outlet[];
  allOutletNames: string[]; 
  allHawkerCentreNames: string[];
  allOutletDemands: number[];
  allCentreDemands: number[];
  allhawkerCentres: HawkerCenter[];
  deliveryDemandInHawkerCentres: Map<string, number>;
  deliveryDemandInOutlets: Map <string, number>;
  leaderboardCentres: Map <string, number>;
  leaderboardOutlets: Map <string, number>;
  leaderboardCentresNames: string[];
  leaderboardOutletNames: string[];
  tempNumberArray: number[];
  tempNameArray: string[];
  deliveryDemandCentresOption: EChartsOption;
  deliveryDemandOutletsOption: EChartsOption;
  deliveryDemandCentresPie: EChartsOption;
  deliveryDemandOutletsPie: EChartsOption;
  deliveryDemandCentreFilter: string;
  deliveryDemandOutletFilter: string;
  user: User;

  constructor(
    private orderService: OrderService,
    private outletService: OutletService,
    private sessionService: SessionService,
    private userService: UserService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.allOrders = [];
    this.allhawkerCentres = [];
    this.deliveryDemandInHawkerCentres = new Map();
    this.deliveryDemandInOutlets = new Map();
    this.allOutlets = [];
    this.allOutletNames = [];
    this.allHawkerCentreNames = [];
    this.allOutletDemands = [];
    this.allCentreDemands = [];
    
    this.tempNumberArray = [];
    this.tempNameArray = [];

    this.user = this.sessionService.getCurrentUser();
    this.orderService.findCompletedOrdersByCustomerId(this.user._id).subscribe(
      orders => {
        
        _.forEach(orders, order => {
          if(!this.allOutlets.includes(order.outlet._id)){
            this.allOutlets.push(order.outlet._id);
          }
          })
        
        this.orderService.findCompletedDeliveryOrdersByDelivererId(this.user._id).subscribe(
          deliveryOrders => {
            _.forEach(deliveryOrders, deliveryOrder =>{
              if(!this.allOutlets.includes(deliveryOrder.outlet._id)){
                this.allOutlets.push(deliveryOrder.outlet._id);
              }

            })
            _.forEach(this.allOutlets, outletId =>{
              this.orderService.findCompletedOrdersByOutletId(outletId).subscribe(
                completedOrders => {
                  _.forEach(completedOrders, completedOrder =>{
                    const now = moment();
                    if(completedOrder.orderType === 'DELIVERY' && completedOrder.orderStatus === 'COMPLETED'
                    && moment(completedOrder.completedTime).isBefore(now.endOf('week'))
                    && moment(completedOrder.completedTime).isAfter(now.startOf('week'))){

                      if(this.deliveryDemandInHawkerCentres.has(completedOrder.outlet.hawkerCentreName)){
                        this.deliveryDemandInHawkerCentres.set(completedOrder.outlet.hawkerCentreName, 
                          this.deliveryDemandInHawkerCentres.get(completedOrder.outlet.hawkerCentreName) + 1);
                      }else{
                        this.deliveryDemandInHawkerCentres.set(completedOrder.outlet.hawkerCentreName, 1);
                      }

                      if(this.deliveryDemandInOutlets.has(completedOrder.outlet.outletName)){
                        this.deliveryDemandInOutlets.set(completedOrder.outlet.outletName,
                          this.deliveryDemandInOutlets.get(completedOrder.outlet.outletName) + 1);
                      }else{
                        this.deliveryDemandInOutlets.set(completedOrder.outlet.outletName, 1);
                      }

                    }
                  })

                  this.allHawkerCentreNames = Array.from(this.deliveryDemandInHawkerCentres.keys());
                  this.allCentreDemands = Array.from(this.deliveryDemandInHawkerCentres.values());

                  this.leaderboardCentres = new Map([...this.deliveryDemandInHawkerCentres.entries()]
                  .sort((a, b) => b[1] - a[1]));
                  this.leaderboardCentresNames = Array.from(this.leaderboardCentres.keys());



                  this.allOutletNames = Array.from(this.deliveryDemandInOutlets.keys());
                  this.allOutletDemands = Array.from(this.deliveryDemandInOutlets.values());

                  this.leaderboardOutlets = new Map([...this.deliveryDemandInOutlets.entries()]
                  .sort((a, b) => b[1] - a[1]));
                  this.leaderboardOutletNames = Array.from(this.leaderboardOutlets.keys());
            

                  this.deliveryDemandCentresOption = {
                    title: {
                      text: 'Delivery Demand From Hawker Centres Near You (Week)',
                    },
                    xAxis: {
                      type: 'category',
                      data: this.allHawkerCentreNames,
                    },
                    yAxis: {
                      type: 'value',
                    },
                    tooltip: {
                      trigger: 'item',
                      showDelay: 0,
                      transitionDuration: 0.2,
                      formatter: function (params) {
                        return `<b>${params['name']}</b> : ${params['value']}`;
                      }
                    },
                    dataZoom: [
                      {
                        type: 'slider',
                        height: 20,
                      },
                      {
                        type: 'slider',
                        yAxisIndex: 0,
                        width: 20,
                      },
                      {
                        type: 'inside',
                        xAxisIndex: 0,
                        filterMode: 'none',
                      },
                      {
                        type: 'inside',
                        yAxisIndex: 0,
                        filterMode: 'none',
                      },
                    ],
                    series: [
                      {
                        data: this.allCentreDemands,
                        type: 'line',
                      },
                    ],
                  };


                  this.deliveryDemandOutletsOption = {
                    title: {
                      text: 'Delivery Demand From Outlets Near You (Week)',
                    },
                    xAxis: {
                      type: 'category',
                      data: this.allOutletNames,
                    },
                    yAxis: {
                      type: 'value',
                    },
                    dataZoom: [
                      {
                        type: 'slider',
                        height: 20,
                      },
                      {
                        type: 'slider',
                        yAxisIndex: 0,
                        width: 20,
                      },
                      {
                        type: 'inside',
                        xAxisIndex: 0,
                        filterMode: 'none',
                      },
                      {
                        type: 'inside',
                        yAxisIndex: 0,
                        filterMode: 'none',
                      },
                    ],
                    tooltip: {
                      trigger: 'item',
                      showDelay: 0,
                      transitionDuration: 0.2,
                      formatter: function (params) {
                        return `<b>${params['name']}</b> : ${params['value']}`;
                      }
                    },
                    series: [
                      {
                        data: this.allOutletDemands,
                        type: 'line',
                      },
                    ],
                  };


                })
              

            })
            
          }
        )
      }
    );

    
    }



  filterDeliveryDemandCentre(){
    
    this.deliveryDemandInHawkerCentres = new Map();

    if(this.deliveryDemandCentreFilter === 'week'){
      _.forEach(this.allOutlets, outletId =>{
        this.orderService.findCompletedOrdersByOutletId(outletId).subscribe(
          completedOrders => {
            _.forEach(completedOrders, completedOrder =>{
              const now = moment();
              if(completedOrder.orderType === 'DELIVERY' && completedOrder.orderStatus === 'COMPLETED'
              && moment(completedOrder.completedTime).isBefore(now.endOf('week')) 
              && moment(completedOrder.completedTime).isAfter(now.startOf('week'))){

                if(this.deliveryDemandInHawkerCentres.has(completedOrder.outlet.hawkerCentreName)){
                  this.deliveryDemandInHawkerCentres.set(completedOrder.outlet.hawkerCentreName, 
                    this.deliveryDemandInHawkerCentres.get(completedOrder.outlet.hawkerCentreName) + 1);
                }else{
                  this.deliveryDemandInHawkerCentres.set(completedOrder.outlet.hawkerCentreName, 1);
                }

              }
            })

            this.allHawkerCentreNames = Array.from(this.deliveryDemandInHawkerCentres.keys());
            this.allCentreDemands = Array.from(this.deliveryDemandInHawkerCentres.values());

            this.leaderboardCentres = new Map([...this.deliveryDemandInHawkerCentres.entries()]
                  .sort((a, b) => b[1] - a[1]));
            this.leaderboardCentresNames = Array.from(this.leaderboardCentres.keys());

            this.deliveryDemandCentresOption = {
              title: {
                text: 'Delivery Demand From Hawker Centres Near You (Week)',
              },
              xAxis: {
                type: 'category',
                data: this.allHawkerCentreNames,
              },
              yAxis: {
                type: 'value',
              },
              tooltip: {
                trigger: 'item',
                showDelay: 0,
                transitionDuration: 0.2,
                formatter: function (params) {
                  return `<b>${params['name']}</b> : ${params['value']}`;
                }
              },
              dataZoom: [
                {
                  type: 'slider',
                  height: 20,
                },
                {
                  type: 'slider',
                  yAxisIndex: 0,
                  width: 20,
                },
                {
                  type: 'inside',
                  xAxisIndex: 0,
                  filterMode: 'none',
                },
                {
                  type: 'inside',
                  yAxisIndex: 0,
                  filterMode: 'none',
                },
              ],
              series: [
                {
                  data: this.allCentreDemands,
                  type: 'line',
                },
              ],
            };

          })
        

      })
    }

    if(this.deliveryDemandCentreFilter === 'day'){
      _.forEach(this.allOutlets, outletId =>{
        this.orderService.findCompletedOrdersByOutletId(outletId).subscribe(
          completedOrders => {
            _.forEach(completedOrders, completedOrder =>{
              const now = moment();
              if(completedOrder.orderType === 'DELIVERY' && completedOrder.orderStatus === 'COMPLETED'
              && moment(completedOrder.completedTime).isBefore(now.endOf('day')) 
              && moment(completedOrder.completedTime).isAfter(now.startOf('day'))){

                if(this.deliveryDemandInHawkerCentres.has(completedOrder.outlet.hawkerCentreName)){
                  this.deliveryDemandInHawkerCentres.set(completedOrder.outlet.hawkerCentreName, 
                    this.deliveryDemandInHawkerCentres.get(completedOrder.outlet.hawkerCentreName) + 1);
                }else{
                  this.deliveryDemandInHawkerCentres.set(completedOrder.outlet.hawkerCentreName, 1);
                }

              }
            })

            this.allHawkerCentreNames = Array.from(this.deliveryDemandInHawkerCentres.keys());
            this.allCentreDemands = Array.from(this.deliveryDemandInHawkerCentres.values());

            this.leaderboardCentres = new Map([...this.deliveryDemandInHawkerCentres.entries()]
                  .sort((a, b) => b[1] - a[1]));
            this.leaderboardCentresNames = Array.from(this.leaderboardCentres.keys());

            this.deliveryDemandCentresOption = {
              title: {
                text: 'Delivery Demand From Hawker Centres Near You (Day)',
              },
              xAxis: {
                type: 'category',
                data: this.allHawkerCentreNames,
              },
              yAxis: {
                type: 'value',
              },
              tooltip: {
                trigger: 'item',
                showDelay: 0,
                transitionDuration: 0.2,
                formatter: function (params) {
                  return `<b>${params['name']}</b> : ${params['value']}`;
                }
              },
              dataZoom: [
                {
                  type: 'slider',
                  height: 20,
                },
                {
                  type: 'slider',
                  yAxisIndex: 0,
                  width: 20,
                },
                {
                  type: 'inside',
                  xAxisIndex: 0,
                  filterMode: 'none',
                },
                {
                  type: 'inside',
                  yAxisIndex: 0,
                  filterMode: 'none',
                },
              ],
              series: [
                {
                  data: this.allCentreDemands,
                  type: 'line',
                },
              ],
            };

          })
        

      })
    }

    if(this.deliveryDemandCentreFilter === 'month'){
      _.forEach(this.allOutlets, outletId =>{
        this.orderService.findCompletedOrdersByOutletId(outletId).subscribe(
          completedOrders => {
            _.forEach(completedOrders, completedOrder =>{
              const now = moment();
              if(completedOrder.orderType === 'DELIVERY' && completedOrder.orderStatus === 'COMPLETED'
              && moment(completedOrder.completedTime).isBefore(now.endOf('month')) 
              && moment(completedOrder.completedTime).isAfter(now.startOf('month'))){

                if(this.deliveryDemandInHawkerCentres.has(completedOrder.outlet.hawkerCentreName)){
                  this.deliveryDemandInHawkerCentres.set(completedOrder.outlet.hawkerCentreName, 
                    this.deliveryDemandInHawkerCentres.get(completedOrder.outlet.hawkerCentreName) + 1);
                }else{
                  this.deliveryDemandInHawkerCentres.set(completedOrder.outlet.hawkerCentreName, 1);
                }

              }
            })

            this.allHawkerCentreNames = Array.from(this.deliveryDemandInHawkerCentres.keys());
            this.allCentreDemands = Array.from(this.deliveryDemandInHawkerCentres.values());

            this.leaderboardCentres = new Map([...this.deliveryDemandInHawkerCentres.entries()]
                  .sort((a, b) => b[1] - a[1]));
            this.leaderboardCentresNames = Array.from(this.leaderboardCentres.keys());

            this.deliveryDemandCentresOption = {
              title: {
                text: 'Delivery Demand From Hawker Centres Near You (Month)',
              },
              xAxis: {
                type: 'category',
                data: this.allHawkerCentreNames,
              },
              yAxis: {
                type: 'value',
              },
              tooltip: {
                trigger: 'item',
                showDelay: 0,
                transitionDuration: 0.2,
                formatter: function (params) {
                  return `<b>${params['name']}</b> : ${params['value']}`;
                }
              },
              dataZoom: [
                {
                  type: 'slider',
                  height: 20,
                },
                {
                  type: 'slider',
                  yAxisIndex: 0,
                  width: 20,
                },
                {
                  type: 'inside',
                  xAxisIndex: 0,
                  filterMode: 'none',
                },
                {
                  type: 'inside',
                  yAxisIndex: 0,
                  filterMode: 'none',
                },
              ],
              series: [
                {
                  data: this.allCentreDemands,
                  type: 'line',
                },
              ],
            };

          })
        

      })
    }

  }

  filterDeliveryDemandOutlet(){
    
    this.deliveryDemandInOutlets = new Map();

    if(this.deliveryDemandOutletFilter === 'week'){
    
      _.forEach(this.allOutlets, outletId =>{
        this.orderService.findCompletedOrdersByOutletId(outletId).subscribe(
          completedOrders => {
            _.forEach(completedOrders, completedOrder =>{
              const now = moment();
              if(completedOrder.orderType === 'DELIVERY' && completedOrder.orderStatus === 'COMPLETED'
              && moment(completedOrder.completedTime).isBefore(now.endOf('week')) 
              && moment(completedOrder.completedTime).isAfter(now.startOf('week'))){

                if(this.deliveryDemandInOutlets.has(completedOrder.outlet.outletName)){
                  this.deliveryDemandInOutlets.set(completedOrder.outlet.outletName, 
                    this.deliveryDemandInOutlets.get(completedOrder.outlet.outletName) + 1);
                }else{
                  this.deliveryDemandInOutlets.set(completedOrder.outlet.outletName, 1);
                }

              }
            })

            this.allOutletNames = Array.from(this.deliveryDemandInOutlets.keys());
            this.allOutletDemands = Array.from(this.deliveryDemandInOutlets.values());

            this.leaderboardOutlets = new Map([...this.deliveryDemandInOutlets.entries()]
                  .sort((a, b) => b[1] - a[1]));
            this.leaderboardOutletNames = Array.from(this.leaderboardOutlets.keys());

            this.deliveryDemandOutletsOption = {
              title: {
                text: 'Delivery Demand From Outlets Near You (Week)',
              },
              xAxis: {
                type: 'category',
                data: this.allOutletNames,
              },
              yAxis: {
                type: 'value',
              },
              tooltip: {
                trigger: 'item',
                showDelay: 0,
                transitionDuration: 0.2,
                formatter: function (params) {
                  return `<b>${params['name']}</b> : ${params['value']}`;
                }
              },
              dataZoom: [
                {
                  type: 'slider',
                  height: 20,
                },
                {
                  type: 'slider',
                  yAxisIndex: 0,
                  width: 20,
                },
                {
                  type: 'inside',
                  xAxisIndex: 0,
                  filterMode: 'none',
                },
                {
                  type: 'inside',
                  yAxisIndex: 0,
                  filterMode: 'none',
                },
              ],
              series: [
                {
                  data: this.allOutletDemands,
                  type: 'line',
                },
              ],
            };

          })
        

      })
    }

    if(this.deliveryDemandOutletFilter === 'day'){
      _.forEach(this.allOutlets, outletId =>{
        this.orderService.findCompletedOrdersByOutletId(outletId).subscribe(
          completedOrders => {
            _.forEach(completedOrders, completedOrder =>{
              const now = moment();
              if(completedOrder.orderType === 'DELIVERY' && completedOrder.orderStatus === 'COMPLETED'
              && moment(completedOrder.completedTime).isBefore(now.endOf('day')) 
              && moment(completedOrder.completedTime).isAfter(now.startOf('day'))){

                if(this.deliveryDemandInOutlets.has(completedOrder.outlet.outletName)){
                  this.deliveryDemandInOutlets.set(completedOrder.outlet.outletName, 
                    this.deliveryDemandInOutlets.get(completedOrder.outlet.outletName) + 1);
                }else{
                  this.deliveryDemandInOutlets.set(completedOrder.outlet.outletName, 1);
                }

              }
            })

            this.allOutletNames = Array.from(this.deliveryDemandInOutlets.keys());
            this.allOutletDemands = Array.from(this.deliveryDemandInOutlets.values());

            this.leaderboardOutlets = new Map([...this.deliveryDemandInOutlets.entries()]
                  .sort((a, b) => b[1] - a[1]));
            this.leaderboardOutletNames = Array.from(this.leaderboardOutlets.keys());

            this.deliveryDemandOutletsOption = {
              title: {
                text: 'Delivery Demand From Outlets Near You (Day)',
              },
              xAxis: {
                type: 'category',
                data: this.allOutletNames,
              },
              yAxis: {
                type: 'value',
              },
              tooltip: {
                trigger: 'item',
                showDelay: 0,
                transitionDuration: 0.2,
                formatter: function (params) {
                  return `<b>${params['name']}</b> : ${params['value']}`;
                }
              },
              dataZoom: [
                {
                  type: 'slider',
                  height: 20,
                },
                {
                  type: 'slider',
                  yAxisIndex: 0,
                  width: 20,
                },
                {
                  type: 'inside',
                  xAxisIndex: 0,
                  filterMode: 'none',
                },
                {
                  type: 'inside',
                  yAxisIndex: 0,
                  filterMode: 'none',
                },
              ],
              series: [
                {
                  data: this.allOutletDemands,
                  type: 'line',
                },
              ],
            };

          })
        

      })
    }

    if(this.deliveryDemandOutletFilter === 'month'){
      _.forEach(this.allOutlets, outletId =>{
        this.orderService.findCompletedOrdersByOutletId(outletId).subscribe(
          completedOrders => {
            _.forEach(completedOrders, completedOrder =>{
              const now = moment();
              if(completedOrder.orderType === 'DELIVERY' && completedOrder.orderStatus === 'COMPLETED'
              && moment(completedOrder.completedTime).isBefore(now.endOf('month')) 
              && moment(completedOrder.completedTime).isAfter(now.startOf('month'))){

                if(this.deliveryDemandInOutlets.has(completedOrder.outlet.outletName)){
                  this.deliveryDemandInOutlets.set(completedOrder.outlet.outletName, 
                    this.deliveryDemandInOutlets.get(completedOrder.outlet.outletName) + 1);
                }else{
                  this.deliveryDemandInOutlets.set(completedOrder.outlet.outletName, 1);
                }

              }
            })

            this.allOutletNames = Array.from(this.deliveryDemandInOutlets.keys());
            this.allOutletDemands = Array.from(this.deliveryDemandInOutlets.values());

            this.leaderboardOutlets = new Map([...this.deliveryDemandInOutlets.entries()]
                  .sort((a, b) => b[1] - a[1]));
            this.leaderboardOutletNames = Array.from(this.leaderboardOutlets.keys());

            this.deliveryDemandOutletsOption = {
              title: {
                text: 'Delivery Demand From Outlets Near You (Month)',
              },
              xAxis: {
                type: 'category',
                data: this.allOutletNames,
              },
              yAxis: {
                type: 'value',
              },
              tooltip: {
                trigger: 'item',
                showDelay: 0,
                transitionDuration: 0.2,
                formatter: function (params) {
                  return `<b>${params['name']}</b> : ${params['value']}`;
                }
              },
              dataZoom: [
                {
                  type: 'slider',
                  height: 20,
                },
                {
                  type: 'slider',
                  yAxisIndex: 0,
                  width: 20,
                },
                {
                  type: 'inside',
                  xAxisIndex: 0,
                  filterMode: 'none',
                },
                {
                  type: 'inside',
                  yAxisIndex: 0,
                  filterMode: 'none',
                },
              ],
              series: [
                {
                  data: this.allOutletDemands,
                  type: 'line',
                },
              ],
            };

          })
        

      })
    }

  }

  closeModal() {
    this.modalController.dismiss();
  }
}
