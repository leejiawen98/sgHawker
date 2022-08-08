import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user';
import { Order } from '../../../models/order';
import { OrderService } from '../../../services/order.service';
import { SessionService } from '../../../services/session.service';
import { UserService } from 'src/app/services/user.service';
import * as _ from "lodash";
import * as moment from 'moment';
import { AlertController, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { EChartsOption } from 'echarts';


@Component({
  selector: 'app-food-spendings',
  templateUrl: './food-spendings.component.html',
  styleUrls: ['./food-spendings.component.scss'],
})
export class FoodSpendingsComponent implements OnInit {

  user: User;
  currentBudgetGoal: number;
  futureBudgetGoal: number;
  segmentModel: string;
  tempModel: string;
  completedSelfOrders: Order[];
  selfTotalSpendings: number;
  foodSpendingFilter: string;
  tempTotalSpendings: number;
  ordersLessThanFiveDollars: number;
  ordersBetweenDollars: number;
  ordersMoreThanTenDollars: number;
  chartOption: EChartsOption;
  goalForm: FormGroup;
  formValid: boolean;
  formSubmitted: boolean;
  currentMonthSpendings: number;
  previousMonthSpendings: number;
  monthlyComparisonPercentage: string;

  constructor(
    private orderService: OrderService,
    private sessionService: SessionService,
    private userService: UserService,
    private alertController: AlertController,
    public formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.goalForm = formBuilder.group({
      futureBudgetGoal: [
        '',
        Validators.compose([Validators.maxLength(100), Validators.required]),
      ],
    });
  }

  ngOnInit() {
    this.formSubmitted = false;
    this.selfTotalSpendings = 0;
    this.ordersLessThanFiveDollars = 0;
    this.ordersBetweenDollars = 0;
    this.ordersMoreThanTenDollars = 0;
    this.currentMonthSpendings = 0;
    this.previousMonthSpendings = 0;
    this.user = this.sessionService.getCurrentUser();
    this.currentBudgetGoal = this.user.currentBudgetGoal;
     
    this.futureBudgetGoal = this.user.futureBudgetGoal;
    if(this.futureBudgetGoal !== undefined){
  }
    this.orderService.findCompletedOrdersByCustomerId(this.user._id).subscribe(
      orders => {
        
        this.completedSelfOrders = orders;
        _.forEach(this.completedSelfOrders, order => {
          
          //this.selfTotalSpendings = order.totalPrice;
          
          const now = moment();
          if(order.orderStatus !== 'CANCELLED' && 
          moment(order.completedTime).isBefore(now.endOf('month')) && moment(order.completedTime).isAfter(now.startOf('month'))){
            this.currentMonthSpendings += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.currentMonthSpendings += order.deliveryFee;
            }
          }

          const rightNow = moment();
          if(order.orderStatus !== 'CANCELLED' && 
          moment(order.completedTime).isBefore(rightNow.subtract(1,'months').endOf('month')) &&
           moment(order.completedTime).isAfter(rightNow.subtract(1,'months').startOf('month'))){
            this.previousMonthSpendings += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.previousMonthSpendings += order.deliveryFee;
            }
          }
          const current = moment();
          if(order.orderStatus !== "CANCELLED" &&  
          moment(order.completedTime).isBefore(current.endOf('week')) && moment(order.completedTime).isAfter(current.startOf('week'))){
            
          if(order.totalPrice > 10){
            this.ordersMoreThanTenDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersMoreThanTenDollars += order.deliveryFee;
            }
          }else if (order.totalPrice < 5){
            this.ordersLessThanFiveDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersLessThanFiveDollars += order.deliveryFee;
            }
          }
          else{
            this.ordersBetweenDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersBetweenDollars += order.deliveryFee;
            }
          }
        }
        });
        this.tempTotalSpendings = this.currentMonthSpendings;


        if(this.previousMonthSpendings !== 0){
          if(this.currentMonthSpendings >= this.previousMonthSpendings){
            this.monthlyComparisonPercentage = '+ ' + ((this.currentMonthSpendings-this.previousMonthSpendings)/this.previousMonthSpendings * 100).toFixed(2) + '%';
          }else{
            this.monthlyComparisonPercentage = ((this.currentMonthSpendings-this.previousMonthSpendings)/this.previousMonthSpendings * 100).toFixed(2) + '%';
          }
          
        }else{
          this.monthlyComparisonPercentage = '+ $' + this.currentMonthSpendings.toFixed(2);
        }

        //this.currentMonthSpendings = this.currentMonthSpendings.toFixed(2)

        this.chartOption = {
          title: {
            text: 'Food Spendings This Week',
          },
          xAxis: {
            type: 'category',
            data: ['< $5', '$5-10', '> $10'],
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
              data: [this.ordersLessThanFiveDollars.toFixed(2), this.ordersBetweenDollars.toFixed(2), this.ordersMoreThanTenDollars.toFixed(2)],
              type: 'line',
            },
          ],
        };

      }
    );
  }

  filterFoodSpending(){
    if(this.foodSpendingFilter === "day"){
      this.ordersLessThanFiveDollars = 0;
      this.ordersBetweenDollars = 0;
      this.ordersMoreThanTenDollars = 0;
      //moment for start date and end date
      _.forEach(this.completedSelfOrders, order => {
        const now = moment();
        if(order.orderStatus !== "CANCELLED" && moment(order.completedTime).isBefore(now.endOf('day')) && moment(order.completedTime).isAfter(now.startOf('day'))){
          if(order.totalPrice > 10){
            this.ordersMoreThanTenDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersMoreThanTenDollars += order.deliveryFee;
            }
          }else if (order.totalPrice < 5){
            this.ordersLessThanFiveDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersLessThanFiveDollars += order.deliveryFee;
            }
          }
          else{
            this.ordersBetweenDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersBetweenDollars += order.deliveryFee;
            }
          }
        }
      });
      this.chartOption = {
        title: {
          text: 'Food Spendings Today',
        },
        xAxis: {
          type: 'category',
          data: ['< $5', '$5-10', '> $10'],
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
            data: [this.ordersLessThanFiveDollars.toFixed(2), this.ordersBetweenDollars.toFixed(2), this.ordersMoreThanTenDollars.toFixed(2)],
            type: 'line',
          },
        ],
      };
      // this.completedSelfOrdersData = [[this.ordersLessThanSixDollars, this.ordersMoreThanSixDollars]];
    }
    if(this.foodSpendingFilter === "week"){
      this.ordersLessThanFiveDollars = 0;
      this.ordersBetweenDollars = 0;
      this.ordersMoreThanTenDollars = 0;
      //moment for start date and end date
      _.forEach(this.completedSelfOrders, order => {
        const now = moment();
        if(order.orderStatus !== "CANCELLED" && moment(order.completedTime).isBefore(now.endOf('week')) && moment(order.completedTime).isAfter(now.startOf('week'))){
          
          if(order.totalPrice > 10){
            this.ordersMoreThanTenDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersMoreThanTenDollars += order.deliveryFee;
            }
          }else if (order.totalPrice < 5){
            this.ordersLessThanFiveDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersLessThanFiveDollars += order.deliveryFee;
            }
          }
          else{
            this.ordersBetweenDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersBetweenDollars += order.deliveryFee;
            }
          }
        }
      });
      this.chartOption = {
        title: {
          text: 'Food Spendings This Week',
        },
        xAxis: {
          type: 'category',
          data: ['< $5', '$5-10', '> $10'],
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
            data: [this.ordersLessThanFiveDollars.toFixed(2), this.ordersBetweenDollars.toFixed(2), this.ordersMoreThanTenDollars.toFixed(2)],
            type: 'line',
          },
        ],
      };
      // this.completedSelfOrdersData = [[this.ordersLessThanSixDollars, this.ordersMoreThanSixDollars]];
    }
    if(this.foodSpendingFilter === "month"){
      this.ordersLessThanFiveDollars = 0;
      this.ordersBetweenDollars = 0;
      this.ordersMoreThanTenDollars = 0;
      //moment for start date and end date
      _.forEach(this.completedSelfOrders, order => {
        const now = moment();
        if(order.orderStatus !== "CANCELLED" && moment(order.completedTime).isBefore(now.endOf('month')) && moment(order.completedTime).isAfter(now.startOf('month'))){
          if(order.totalPrice > 10){
            this.ordersMoreThanTenDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersMoreThanTenDollars += order.deliveryFee;
            }
          }else if (order.totalPrice < 5){
            this.ordersLessThanFiveDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersLessThanFiveDollars += order.deliveryFee;
            }
          }
          else{
            this.ordersBetweenDollars += order.totalPrice;
            if(order.orderType === "DELIVERY"){
              this.ordersBetweenDollars += order.deliveryFee;
            }
          }
        }
      });
      this.chartOption = {
        title: {
          text: 'Food Spendings This Month',
        },
        xAxis: {
          type: 'category',
          data: ['< $5', '$5-10', '> $10'],
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
            data: [this.ordersLessThanFiveDollars.toFixed(2), this.ordersBetweenDollars.toFixed(2), this.ordersMoreThanTenDollars.toFixed(2)],
            type: 'line',
          },
        ],
      };
      // this.completedSelfOrdersData = [[this.ordersLessThanSixDollars, this.ordersMoreThanSixDollars]];
    }
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

  get errorControl() {
    return this.goalForm.controls;
  }

  checkFormValid() {
    this.formValid = true;
    const controls = this.goalForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  checkMonthlyPercentage(){
    
    if(this.monthlyComparisonPercentage !== undefined){
      return this.monthlyComparisonPercentage.includes("-");
    }
  }

  updateDetails() {
    this.formSubmitted = true;
    this.futureBudgetGoal = this.goalForm.value.futureBudgetGoal;

    this.userService
      .updateFutureBudgetGoal(this.user._id, this.futureBudgetGoal)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.ngOnInit();
            this.presentAlert('Success', 'Budget Goal For Next Month Updated Successfully!');
        },
        error => {
          this.ngOnInit();
          this.presentAlert('Hmm..something went wrong', 'Unable to update budget goal: ' + error);
        }
      );
  }

  closeModal() {
    this.modalController.dismiss();
  }

}
