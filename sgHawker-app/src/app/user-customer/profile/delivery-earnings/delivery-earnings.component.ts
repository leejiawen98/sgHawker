import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { EChartsOption } from 'echarts';
import { User } from '../../../models/user';
import { Order } from '../../../models/order';
import { OrderService } from '../../../services/order.service';
import { OutletService } from '../../../services/outlet.service';
import { SessionService } from '../../../services/session.service';
import { UserService } from 'src/app/services/user.service';
import * as _ from "lodash";
import * as moment from 'moment';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-delivery-earnings',
  templateUrl: './delivery-earnings.component.html',
  styleUrls: ['./delivery-earnings.component.scss'],
})
export class DeliveryEarningsComponent implements OnInit {

  user: User;
  tempDeliveryEarnings: number;
  deliveryEarningsFilter: string;
  allDeliveryOrders: Order[];
  chartOption: EChartsOption;
  earningsOutletChartOption: EChartsOption;
  earningsCentresChartOption: EChartsOption;
  earningsBreakdownChartOption: EChartsOption;
  thisMonthDeliveryEarnings: number;
  lastMonthDeliveryEarnings: number;
  monthlyComparisonPercentage: string;
  earningsAcrossDiffOutlets: Map <string, number>;
  earningsAcrossDiffCentres: Map <string, number>;
  earningsAcrossPeriodOfTime: Map <string, number>;
  deliveryCentresName: string[];
  allDeliverers: Map <string, number>;
  sortedDeliverers: Map <string, number>;
  sortedDeliverersName: string[];
  sortedDeliverersEarnings: number[];

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private outletService: OutletService,
    private sessionService: SessionService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.tempDeliveryEarnings = 0;
    this.thisMonthDeliveryEarnings = 0;
    this.lastMonthDeliveryEarnings = 0;
    this.earningsAcrossDiffCentres = new Map();
    this.earningsAcrossDiffOutlets = new Map();
    this.allDeliverers = new Map();
    this.sortedDeliverersName = [];
    this.sortedDeliverersEarnings = [];
    this.user = this.sessionService.getCurrentUser();

    this.orderService.findCompletedDeliveryOrdersByDelivererId(this.user._id).subscribe(
      orders => {
        this.allDeliveryOrders = orders;
        _.forEach(orders, order => {
          const now = moment();
          //default by week
          if(order.orderStatus !== 'CANCELLED' &&
          moment(order.completedTime).isBefore(now.endOf('week')) && moment(order.completedTime).isAfter(now.startOf('week'))){
            this.tempDeliveryEarnings += (order.deliveryFee - order.deliveryCommission);

            if(this.earningsAcrossDiffOutlets.has(order.outlet.outletName)){
              this.earningsAcrossDiffOutlets.set(order.outlet.outletName,
                this.earningsAcrossDiffOutlets.get(order.outlet.outletName) + (order.deliveryFee - order.deliveryCommission));
            }else{
              this.earningsAcrossDiffOutlets.set(order.outlet.outletName,(order.deliveryFee - order.deliveryCommission));
            }

            if(this.earningsAcrossDiffCentres.has(order.outlet.hawkerCentreName)){
              this.earningsAcrossDiffCentres.set(order.outlet.hawkerCentreName,
                this.earningsAcrossDiffCentres.get(order.outlet.hawkerCentreName) + (order.deliveryFee - order.deliveryCommission));
            }else{
              this.earningsAcrossDiffCentres.set(order.outlet.hawkerCentreName,(order.deliveryFee - order.deliveryCommission));
            }
          }
          if(order.orderStatus !== 'CANCELLED' &&
            moment(order.completedTime).isBefore(now.endOf('month')) && moment(order.completedTime).isAfter(now.startOf('month'))){
            this.thisMonthDeliveryEarnings += (order.deliveryFee - order.deliveryCommission);
          }
          if(order.orderStatus !== 'CANCELLED' &&
            moment(order.completedTime).isBefore(now.subtract(1,'months').endOf('month')) &&
          moment(order.completedTime).isAfter(now.subtract(1,'months').startOf('month'))){
            this.lastMonthDeliveryEarnings += (order.deliveryFee - order.deliveryCommission);
          }
        });

        

        if(this.lastMonthDeliveryEarnings !== 0){
          if(this.thisMonthDeliveryEarnings >= this.lastMonthDeliveryEarnings){
            this.monthlyComparisonPercentage = '+ ' + ((this.thisMonthDeliveryEarnings-this.lastMonthDeliveryEarnings)/this.lastMonthDeliveryEarnings * 100).toFixed(2) + '%';
          }else{
            this.monthlyComparisonPercentage = ((this.thisMonthDeliveryEarnings-this.lastMonthDeliveryEarnings)/this.lastMonthDeliveryEarnings * 100).toFixed(2) + '%';
          }
          
        }else{
          this.monthlyComparisonPercentage = '+ $' + this.thisMonthDeliveryEarnings.toFixed(2);
        }

        this.earningsCentresChartOption = {
          title: {
            text: 'Earnings From Hawker Centres (Week)',
          },
          xAxis: {
            type: 'category',
            data: Array.from(this.earningsAcrossDiffCentres.keys()),
          },
          yAxis: {
            type: 'value',
          },

          tooltip: {
            trigger: 'item',
            showDelay: 0,
            transitionDuration: 0.2,
            formatter: function (params) {
              return `<b>${params['name']}</b> : $ ${params['value']}`;
            }
          },
          series: [
            {
              data: Array.from(this.earningsAcrossDiffCentres.values()),
              type: 'line',
            },
          ],
        };

        this.earningsOutletChartOption = {
          title: {
            text: 'Earnings From Hawker Outlets (Week)',
          },
          xAxis: {
            type: 'category',
            data: Array.from(this.earningsAcrossDiffOutlets.keys()),
          },
          yAxis: {
            type: 'value',
          },
          tooltip: {
            trigger: 'item',
            showDelay: 0,
            transitionDuration: 0.2,
            formatter: function (params) {
              return `<b>${params['name']}</b> : $ ${params['value']}`;
            }
          },
          series: [
            {
              data: Array.from(this.earningsAcrossDiffOutlets.values()),
              type: 'line',
            },
          ],
        };

        this.deliveryCentresName = Array.from(this.earningsAcrossDiffCentres.keys());

        const requests = this.deliveryCentresName.map( centre => this.orderService.findAllCompletedDeliveryOrdersByHawkerCenter(centre));

        forkJoin(requests).subscribe(responses =>{
          _.forEach(responses, response =>{
            _.forEach(response, order =>{
              const now = moment();
              if(moment(order.completedTime).isBefore(now.endOf('month')) && moment(order.completedTime).isAfter(now.startOf('month'))){

                if(this.allDeliverers.has(order.deliverer.name)){
                  this.allDeliverers.set(order.deliverer.name, this.allDeliverers.get(order.deliverer.name) + (order.deliveryFee - order.deliveryCommission));
                }else{
                  this.allDeliverers.set(order.deliverer.name, (order.deliveryFee - order.deliveryCommission));
                }
              }
            })
          })


          this.sortedDeliverers = new Map([...this.allDeliverers.entries()]
        .sort((a, b) => b[1] - a[1]));
        this.sortedDeliverersName = Array.from(this.sortedDeliverers.keys());
        this.sortedDeliverersEarnings = Array.from(this.sortedDeliverers.values());

        });



      }
    );
  }

  findCompletedOrdersbyCentre(centreName){
    this.orderService.findAllCompletedDeliveryOrdersByHawkerCenter(centreName).subscribe(
      deliveryOrders => {
        _.forEach(deliveryOrders, order =>{
          if(this.allDeliverers.has(order.deliverer.name)){
            this.allDeliverers.set(order.deliverer.name, this.allDeliverers.get(order.deliverer.name) + (order.deliveryFee - order.deliveryCommission));
          }else{
            this.allDeliverers.set(order.deliverer.name, (order.deliveryFee - order.deliveryCommission));
          }
        })

        return this.allDeliverers;
      }
    )
  }

  filterDeliveryEarning(){
    this.tempDeliveryEarnings = 0;
    this.earningsAcrossDiffCentres = new Map();
    this.earningsAcrossDiffOutlets = new Map();
    if(this.deliveryEarningsFilter === "day"){

      _.forEach(this.allDeliveryOrders, order => {
        const now = moment();

        if(order.orderStatus !== 'CANCELLED' &&
          moment(order.completedTime).isBefore(now.endOf('day')) && moment(order.completedTime).isAfter(now.startOf('day'))){
          this.tempDeliveryEarnings += (order.deliveryFee - order.deliveryCommission);
          if(this.earningsAcrossDiffOutlets.has(order.outlet.outletName)){
            this.earningsAcrossDiffOutlets.set(order.outlet.outletName,
              this.earningsAcrossDiffOutlets.get(order.outlet.outletName) + (order.deliveryFee - order.deliveryCommission));
          }else{
            this.earningsAcrossDiffOutlets.set(order.outlet.outletName,(order.deliveryFee - order.deliveryCommission));
          }

          if(this.earningsAcrossDiffCentres.has(order.outlet.hawkerCentreName)){
            this.earningsAcrossDiffCentres.set(order.outlet.hawkerCentreName,
              this.earningsAcrossDiffCentres.get(order.outlet.hawkerCentreName) + (order.deliveryFee - order.deliveryCommission));
          }else{
            this.earningsAcrossDiffCentres.set(order.outlet.hawkerCentreName,(order.deliveryFee - order.deliveryCommission));
          }
        }
      });

      this.earningsCentresChartOption = {
        title: {
          text: 'Earnings From Hawker Centres (Day)',
        },
        xAxis: {
          type: 'category',
          data: Array.from(this.earningsAcrossDiffCentres.keys()),
        },
        yAxis: {
          type: 'value',
        },
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          transitionDuration: 0.2,
          formatter: function (params) {
            return `<b>${params['name']}</b> : $ ${params['value']}`;
          }
        },
        series: [
          {
            data: Array.from(this.earningsAcrossDiffCentres.values()),
            type: 'line',
          },
        ],
      };

      this.earningsOutletChartOption = {
        title: {
          text: 'Earnings From Hawker Outlets (Day)',
        },
        xAxis: {
          type: 'category',
          data: Array.from(this.earningsAcrossDiffOutlets.keys()),
        },
        yAxis: {
          type: 'value',
        },
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          transitionDuration: 0.2,
          formatter: function (params) {
            return `<b>${params['name']}</b> : $ ${params['value']}`;
          }
        },
        series: [
          {
            data: Array.from(this.earningsAcrossDiffOutlets.values()),
            type: 'line',
          },
        ],
      };
    }
    if(this.deliveryEarningsFilter === "week"){
      _.forEach(this.allDeliveryOrders, order => {
        const now = moment();
        //default by week
        if(order.orderStatus !== 'CANCELLED' &&
          moment(order.completedTime).isBefore(now.endOf('week')) && moment(order.completedTime).isAfter(now.startOf('week'))){
          this.tempDeliveryEarnings += (order.deliveryFee - order.deliveryCommission);
          if(this.earningsAcrossDiffOutlets.has(order.outlet.outletName)){
            this.earningsAcrossDiffOutlets.set(order.outlet.outletName,
              this.earningsAcrossDiffOutlets.get(order.outlet.outletName) + (order.deliveryFee - order.deliveryCommission));
          }else{
            this.earningsAcrossDiffOutlets.set(order.outlet.outletName,(order.deliveryFee - order.deliveryCommission));
          }

          if(this.earningsAcrossDiffCentres.has(order.outlet.hawkerCentreName)){
            this.earningsAcrossDiffCentres.set(order.outlet.hawkerCentreName,
              this.earningsAcrossDiffCentres.get(order.outlet.hawkerCentreName) + (order.deliveryFee - order.deliveryCommission));
          }else{
            this.earningsAcrossDiffCentres.set(order.outlet.hawkerCentreName,(order.deliveryFee - order.deliveryCommission));
          }
        }
      });
      this.earningsCentresChartOption = {
        title: {
          text: 'Earnings From Hawker Centres (Week)',
        },
        xAxis: {
          type: 'category',
          data: Array.from(this.earningsAcrossDiffCentres.keys()),
        },
        yAxis: {
          type: 'value',
        },
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          transitionDuration: 0.2,
          formatter: function (params) {
            return `<b>${params['name']}</b> : $ ${params['value']}`;
          }
        },
        series: [
          {
            data: Array.from(this.earningsAcrossDiffCentres.values()),
            type: 'line',
          },
        ],
      };

      this.earningsOutletChartOption = {
        title: {
          text: 'Earnings From Hawker Outlets (Week)',
        },
        xAxis: {
          type: 'category',
          data: Array.from(this.earningsAcrossDiffOutlets.keys()),
        },
        yAxis: {
          type: 'value',
        },
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          transitionDuration: 0.2,
          formatter: function (params) {
            return `<b>${params['name']}</b> : $ ${params['value']}`;
          }
        },
        series: [
          {
            data: Array.from(this.earningsAcrossDiffOutlets.values()),
            type: 'line',
          },
        ],
      };

    }
    if(this.deliveryEarningsFilter === "month"){
      _.forEach(this.allDeliveryOrders, order => {
        const now = moment();

        if(order.orderStatus !== 'CANCELLED' &&
          moment(order.completedTime).isBefore(now.endOf('month')) && moment(order.completedTime).isAfter(now.startOf('month'))){
          this.tempDeliveryEarnings += (order.deliveryFee - order.deliveryCommission);
          if(this.earningsAcrossDiffOutlets.has(order.outlet.outletName)){
            this.earningsAcrossDiffOutlets.set(order.outlet.outletName,
              this.earningsAcrossDiffOutlets.get(order.outlet.outletName) + (order.deliveryFee - order.deliveryCommission));
          }else{
            this.earningsAcrossDiffOutlets.set(order.outlet.outletName,(order.deliveryFee - order.deliveryCommission));
          }

          if(this.earningsAcrossDiffCentres.has(order.outlet.hawkerCentreName)){
            this.earningsAcrossDiffCentres.set(order.outlet.hawkerCentreName,
              this.earningsAcrossDiffCentres.get(order.outlet.hawkerCentreName) + (order.deliveryFee - order.deliveryCommission));
          }else{
            this.earningsAcrossDiffCentres.set(order.outlet.hawkerCentreName,(order.deliveryFee - order.deliveryCommission));
          }
        }
      });

      this.earningsCentresChartOption = {
        title: {
          text: 'Earnings From Hawker Centres (Month)',
        },
        xAxis: {
          type: 'category',
          data: Array.from(this.earningsAcrossDiffCentres.keys()),
        },
        yAxis: {
          type: 'value',
        },
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          transitionDuration: 0.2,
          formatter: function (params) {
            return `<b>${params['name']}</b> : $ ${params['value']}`;
          }
        },
        series: [
          {
            data: Array.from(this.earningsAcrossDiffCentres.values()),
            type: 'line',
          },
        ],
      };

      this.earningsOutletChartOption = {
        title: {
          text: 'Earnings From Hawker Outlets (Month)',
        },
        xAxis: {
          type: 'category',
          data: Array.from(this.earningsAcrossDiffOutlets.keys()),
        },
        yAxis: {
          type: 'value',
        },
        tooltip: {
          trigger: 'item',
          showDelay: 0,
          transitionDuration: 0.2,
          formatter: function (params) {
            return `<b>${params['name']}</b> : $ ${params['value']}`;
          }
        },
        series: [
          {
            data: Array.from(this.earningsAcrossDiffOutlets.values()),
            type: 'line',
          },
        ],
      };
    }

  }

  checkMonthlyPercentage(){
    
    if(this.monthlyComparisonPercentage !== undefined){
      return this.monthlyComparisonPercentage.includes("-");
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

}
