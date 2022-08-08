/* eslint-disable no-underscore-dangle */
import { LeaderboardService } from 'src/app/services/leaderboard.service';
import { LeaderboardTimeFramesTypeEnum } from './../../models/enums/leaderboard-time-frames-enum.enum';
import { GoalCategoryEnum } from './../../models/enums/goal-category-enum';
import { EditGoalPage } from './edit-goal/edit-goal.page';
import { GoalPeriodEnum } from './../../models/enums/goal-period-enum';
import { AddGoalPage } from './add-goal/add-goal.page';
import { AnalyticsDateTypeEnum } from './../../models/enums/analytics-date-type-enum';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Order } from 'src/app/models/order';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';
import * as moment from 'moment';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { ModalController } from '@ionic/angular';
import { Goal } from 'src/app/models/submodels/goal';
import * as _ from 'lodash';
import { ToastController } from '@ionic/angular';
import { number } from 'echarts';

enum ActivateType {
  WEEK,
  MONTH,
  SIX_MONTHS,
}
@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
})
export class AnalyticsPage implements OnInit {
  segmentModel = 'overview';
  completedOrders: Order[];
  hawker: User;
  outlet: Outlet;

  earningsChart: any[];
  salesChart: any[];
  foodItemChart: any[];
  orderPerformanceChart: any[];
  dinerTypeChart: any[];
  paymentTypeChart: any[];
  cashbackChart: any[];

  masterEarningsChart: any[];
  masterSalesChart: any[];
  masterFoodItemChart: any[];
  masterOrderPerformanceChart: any[];
  masterDinerTypeChart: any[];
  masterPaymentTypeChart: any[];
  masterCashbackChart: any[];

  totalEarnings: number;
  totalNumOfSales: number;

  startDate: Date;
  endDate: Date;

  chartDateType: AnalyticsDateTypeEnum;
  activate: ActivateType | null;
  masterOutlet: boolean;
  ActivateType = ActivateType;
  hawkerOutlets: Outlet[];
  selectedOutlets: Outlet[];

  title: string;

  //GOALS
  salesTarget: any;
  earningsTarget: any;

  actualSales: number;
  actualPastSales: number;
  actualEarnings: number;
  actualPastEarnings: number;
  dateToday: Date;

  masterSales: any[];
  masterEarnings: any[];
  masterView: boolean;
  columnSize: number;

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
  };

  //COMPARATIVE ANALYTICS
  currentLeaderboardSaleRank: any;
  leaderboardSaleRankTypeCard: string;
  currentLeaderboardFavouriteRank: any;

  allHawkerSalesRank: any[];
  actualHawkerSalesRank: any[];
  allFoodItemSalesRank: any[];
  allFoodItemName: string[];
  foodItemsRank: any[];

  selectedCuisineType: string;
  selectedTimeFrame: string;

  timeFrameSelections = [
    { label: 'Last 7 Days', value: LeaderboardTimeFramesTypeEnum.LAST_7_DAYS },
    {
      label: 'Last 30 Days',
      value: LeaderboardTimeFramesTypeEnum.LAST_30_DAYS,
    },
    {
      label: 'Last 60 Days',
      value: LeaderboardTimeFramesTypeEnum.LAST_60_DAYS,
    },
    {
      label: 'Overall',
      value: 'OVERALL'
    }
  ];

  constructor(
    private sessionService: SessionService,
    private hawkerAnalytics: AnalyticsService,
    public modalController: ModalController,
    private toastController: ToastController,
    private leaderboardService: LeaderboardService
  ) {
  }

  ngOnInit() {
    this.activate = null;
  }

  ionViewWillEnter() {
    this.chartDateType = AnalyticsDateTypeEnum.DAYS;
    this.hawker = this.sessionService.getCurrentUser();
    this.outlet = this.sessionService.getCurrentOutlet();

    this.masterOutlet = this.outlet.isMaster;
    if (this.masterOutlet) {
      this.hawkerOutlets = this.hawker.outlets;
    }
    this.initView();


    //GOALS
    this.masterSales = [];
    this.masterEarnings = [];
    this.dateToday = new Date();

    this.salesTarget = undefined;
    this.earningsTarget = undefined;

    //Check if there is existing goal
    this.checkExistGoal();

    if (this.outlet.isMaster) {
      this.checkExistMasterGoal();
    }

    this.masterView = false;
    this.columnSize = 4.7;

    //COMPARATIVE ANALYTICS
    if (this.outlet.cuisineType.length !== 0) {
      this.selectedCuisineType = this.outlet.cuisineType[0];
    } else {
      this.selectedCuisineType = null;
    }
    this.selectedTimeFrame = LeaderboardTimeFramesTypeEnum.LAST_7_DAYS;
    this.allHawkerSalesRank = [];
    this.allFoodItemSalesRank = [];
    this.foodItemsRank = [];
    this.actualHawkerSalesRank = [];
    this.allFoodItemName = [];

    this.getSalesLeaderboardRanking();
    this.getFavouritesLeaderboardRanking();
    this.updateGraph();

  }

  initView() {
    this.chartDateType = AnalyticsDateTypeEnum.DAYS;
    this.retrieveData(
      moment().startOf('month').toDate(),
      moment().endOf('day').toDate(),
      this.chartDateType
    );
    this.title = 'For This Month';
  }

  filterDate() {
    if (!this.startDate || !this.endDate || this.startDate > this.endDate) {
      this.presentToast();
    } else {
      const startDateM = moment(this.startDate);
      const endDateM = moment(this.endDate);
      const dateDiff = endDateM.diff(startDateM, 'days');
      // if (dateDiff < 61) {
      //   this.chartDateType = AnalyticsDateTypeEnum.DAYS;
      // } else if (dateDiff > 60 && dateDiff < 81) {
      //   this.chartDateType = AnalyticsDateTypeEnum.WEEKS;
      // } else if (dateDiff > 80 && dateDiff < 366) {
      //   this.chartDateType = AnalyticsDateTypeEnum.MONTHS;
      // } else if (dateDiff > 365) {
      //   this.chartDateType = AnalyticsDateTypeEnum.YEARS;
      // }

      this.retrieveData(this.startDate, this.endDate, this.chartDateType);

      this.title =
        'From ' +
        startDateM.format('MMM DD, YYYY') +
        ' to ' +
        endDateM.format('MMM DD, YYYY');
      this.activate = null;
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Invalid date input. Please key in again',
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
    this.startDate = undefined;
    this.endDate = undefined;
  }

  resetView() {
    this.activate = null;
    this.startDate = undefined;
    this.endDate = undefined;
    this.selectedOutlets = null;
    this.initView();
  }

  quickAccessFilter(view: ActivateType) {
    this.activate = view;
    if (this.activate === ActivateType.WEEK) {
      this.chartDateType = AnalyticsDateTypeEnum.DAYS;
      this.startDate = moment().subtract(1, 'week').startOf('week').toDate();
      this.endDate = moment().subtract(1, 'week').endOf('week').toDate();
      this.title = 'For Last Week';
    } else if (this.activate === ActivateType.MONTH) {
      this.chartDateType = AnalyticsDateTypeEnum.DAYS;
      this.startDate = moment().subtract(1, 'month').startOf('month').toDate();
      this.endDate = moment().subtract(1, 'month').endOf('month').toDate();
      this.title = 'For Last Month';
    } else if (this.activate === ActivateType.SIX_MONTHS) {
      this.chartDateType = AnalyticsDateTypeEnum.DAYS;
      this.startDate = moment().subtract(6, 'month').startOf('month').toDate();
      this.endDate = moment().subtract(1, 'month').endOf('month').toDate();
      this.title = 'For Last 6 Months';
    }
    if (!this.selectedOutlets) {
      this.retrieveData(this.startDate, this.endDate, this.chartDateType);
    } else if (this.selectedOutlets) {
      this.onSelectedOutlets();
    }
    this.startDate = undefined;
    this.endDate = undefined;
  }

  retrieveData(startDate, endDate, chartDateType) {
    if (this.masterOutlet) {
      let isFirst1 = true;
      for (const outlet of this.hawker.outlets) {
        this.hawkerAnalytics
          .generateHawkerAnalyticsForOutlet(
            outlet._id,
            startDate,
            endDate,
            chartDateType
          )
          .subscribe((result) => {
            this.processDataFromApi(result, outlet.outletName, isFirst1);
            isFirst1 = false;
          });
      }
    } else {
      this.hawkerAnalytics
        .generateHawkerAnalyticsForOutlet(
          this.outlet._id,
          startDate,
          endDate,
          chartDateType
        )
        .subscribe((result) => {
          this.processDataFromApi(result);
        });
    }
  }

  processDataFromApi(data, outletName?, isFirst?) {
    // IF OUTLETNAME IS PASSED => MASTER OUTLET
    // IF ISFIRST => MASTER OUTLET'S FIRST OUTLET
    if (outletName) {
      const nameToDisplay = outletName;
      if (isFirst) {
        this.earningsChart = [];
        this.salesChart = [];
        this.foodItemChart = [];
        this.orderPerformanceChart = [];
        this.dinerTypeChart = [];
        this.paymentTypeChart = [];
        this.cashbackChart = [];

        this.totalEarnings = data.sales.totalEarnings;
        this.totalNumOfSales = data.noOfSales.totalNumOfSales;
      }

      this.earningsChart = [
        ...this.earningsChart,
        {
          ...data.sales,
          name: nameToDisplay,
        },
      ];
      this.salesChart = [
        ...this.salesChart,
        {
          ...data.noOfSales,
          name: nameToDisplay,
        },
      ];
      this.foodItemChart = [
        ...this.foodItemChart,
        {
          ...data.foodItems,
          name: nameToDisplay,
        },
      ];
      this.orderPerformanceChart = [
        ...this.orderPerformanceChart,
        {
          ...data.immediateOrders,
          name: nameToDisplay,
        },
      ];
      this.dinerTypeChart = [
        ...this.dinerTypeChart,
        {
          ...data.dinerTypes,
          name: nameToDisplay,
        },
      ];
      this.paymentTypeChart = [
        ...this.paymentTypeChart,
        {
          ...data.paymentTypes,
          name: nameToDisplay,
        },
      ];
      this.cashbackChart = [
        ...this.cashbackChart,
        {
          ...data.cashbackTypes,
          name: nameToDisplay,
        },
      ];
      this.totalEarnings += data.sales.totalEarnings;
      this.totalNumOfSales += data.noOfSales.totalNumOfSales;
    } else {
      this.earningsChart = [data.sales];
      this.salesChart = [data.noOfSales];
      this.foodItemChart = [data.foodItems];
      this.orderPerformanceChart = [data.immediateOrders];
      this.dinerTypeChart = [data.dinerTypes];
      this.paymentTypeChart = [data.paymentTypes];
      this.cashbackChart = [data.cashbackTypes];
      this.totalEarnings = data.sales.totalEarnings;
      this.totalNumOfSales = data.noOfSales.totalNumOfSales;
    }

    this.masterEarningsChart = _.cloneDeep(this.earningsChart);
    this.masterSalesChart = _.cloneDeep(this.salesChart);
    this.masterFoodItemChart = _.cloneDeep(this.foodItemChart);
    this.masterOrderPerformanceChart = _.cloneDeep(this.orderPerformanceChart);
    this.masterDinerTypeChart = _.cloneDeep(this.dinerTypeChart);
    this.masterPaymentTypeChart = _.cloneDeep(this.paymentTypeChart);
    this.masterCashbackChart = _.cloneDeep(this.cashbackChart);
    this.onSelectedOutlets();
  }

  onSelectedOutlets() {
    if (!this.selectedOutlets) {
      return;
    }

    if (this.selectedOutlets.length === 0) {
      this.selectedOutlets = null;
      this.earningsChart = this.masterEarningsChart;
      this.salesChart = this.masterSalesChart;
      this.orderPerformanceChart = this.masterOrderPerformanceChart;
      this.foodItemChart = this.masterFoodItemChart;
      this.paymentTypeChart = this.masterPaymentTypeChart;
      this.dinerTypeChart = this.masterDinerTypeChart;
      this.cashbackChart = this.masterCashbackChart;
      return;
    }

    this.earningsChart = this.masterEarningsChart.filter((chartItem) =>
      this.selectedOutlets.find(
        (outlet) => outlet.outletName === chartItem.name
      )
    );
    this.salesChart = this.masterSalesChart.filter((chartItem) =>
      this.selectedOutlets.find(
        (outlet) => outlet.outletName === chartItem.name
      )
    );
    this.foodItemChart = this.masterFoodItemChart.filter((chartItem) =>
      this.selectedOutlets.find(
        (outlet) => outlet.outletName === chartItem.name
      )
    );
    this.orderPerformanceChart = this.masterOrderPerformanceChart.filter((chartItem) =>
      this.selectedOutlets.find(
        (outlet) => outlet.outletName === chartItem.name
      )
    );
    this.dinerTypeChart = this.masterDinerTypeChart.filter((chartItem) =>
      this.selectedOutlets.find(
        (outlet) => outlet.outletName === chartItem.name
      )
    );
    this.paymentTypeChart = this.masterPaymentTypeChart.filter((chartItem) =>
      this.selectedOutlets.find(
        (outlet) => outlet.outletName === chartItem.name
      )
    );
    this.cashbackChart = this.masterCashbackChart.filter((chartItem) =>
      this.selectedOutlets.find(
        (outlet) => outlet.outletName === chartItem.name
      )
    );
  }

  //GOAL

  checkExistGoal() {
    if (this.outlet.goals.length !== 0) {
      this.salesTarget = _.filter(this.outlet.goals, goal => goal.goalCategory === 'SALES')[0];
      this.earningsTarget = _.filter(this.outlet.goals, goal => goal.goalCategory === 'EARNINGS')[0];
      if (this.salesTarget !== undefined) {
        this.getNumOfSalesForGoal();
      }
      if (this.earningsTarget !== undefined) {
        this.getEarningsForGoal();
      }
    }
  }
  checkExistMasterGoal() {
    this.getAllOutletsNumOfSales();
  }

  //Add Goal if there is no target set
  async openAddGoalModal(category: string) {
    const modal = await this.modalController.create({
      component: AddGoalPage,
      cssClass: 'my-custom-class',
      componentProps: {
        outlet: this.outlet,
        cat: category
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        console.log(data.data);
        this.outlet = data.data;
        this.sessionService.setCurrentOutlet(data.data);
        console.log(this.outlet);
        this.checkExistGoal();

        if (this.outlet.isMaster) {
          for (let i = 0; i < this.hawker.outlets.length; i++) {
            if (this.hawker.outlets[i]._id === this.outlet._id) {
              this.hawker.outlets[i] = this.outlet;
              break;
            }
          }
          this.sessionService.setCurrentUser(this.hawker);
        }

        if (category === GoalCategoryEnum.SALES) {
          this.getNumOfSalesForGoal();
          if (this.outlet.isMaster) {
            this.getAllOutletsNumOfSales();
          }
        } else if (category === GoalCategoryEnum.EARNINGS) {
          this.getEarningsForGoal();
          if (this.outlet.isMaster) {
            this.masterEarnings = [];
            this.getAllOutletsEarnings();
          }
        }

      }
    });
    return await modal.present();
  }


  getNumOfSalesForGoal() {
    const goal = this.getStartAndEndDate(this.salesTarget);
    this.getNumOfSales(goal, false, this.outlet);
  }

  getEarningsForGoal() {
    const goal = this.getStartAndEndDate(this.earningsTarget);
    this.getEarnings(goal, false, this.outlet);
  }

  getNumOfSales(goal, forMaster, outlet) {
    this.hawkerAnalytics.findNumOfSalesByOutletIdForSpecificPeriod(outlet._id, goal.goalStartDate, goal.goalEndDate)
      .subscribe(result => {
        const prevDate = this.getPrevStartAndEndDate(goal);
        if (!forMaster) {
          this.actualSales = result.sum;

          if ((this.actualSales / goal.targetAmount) * 100 < 25) {
            this.salesTarget = {
              ...this.salesTarget,
              color: '#FC100D'
            };
          } else if ((this.actualSales / goal.targetAmount) * 100 >= 25 &&
            (this.actualSales / goal.targetAmount) * 100 <= 75) {
            this.salesTarget = {
              ...this.salesTarget,
              color: '#FF8B00'
            };
          } else if ((this.actualSales / goal.targetAmount * 100) > 75) {
            this.salesTarget = {
              ...this.salesTarget,
              color: '#4BB543'
            };
          }
          this.hawkerAnalytics.findNumOfSalesByOutletIdForSpecificPeriod(outlet._id, prevDate.prevStartDate, prevDate.prevEndDate)
            .subscribe(prevResult => {
              this.salesTarget = {
                ...this.salesTarget,
                prevSales: prevResult.sum
              };
              if (this.earningsTarget !== undefined) {
                this.getEarningsForGoal();
              }
            }
            );
        } else {

          if ((result.sum / goal.targetAmount) * 100 < 25) {
            goal = {
              ...goal,
              color: '#FC100D'
            };
          } else if ((result.sum / goal.targetAmount) * 100 >= 25 &&
            (result.sum / goal.targetAmount) * 100 <= 75) {
            goal = {
              ...goal,
              color: '#FF8B00'
            };
          } else if ((result.sum / goal.targetAmount * 100) > 75) {
            goal = {
              ...goal,
              color: '#4BB543'
            };
          }
          this.hawkerAnalytics.findNumOfSalesByOutletIdForSpecificPeriod(outlet._id, prevDate.prevStartDate, prevDate.prevEndDate)
            .subscribe(prevResult => {
              goal = {
                ...goal,
                prevSales: prevResult.sum
              };
              this.masterSales.push({ outlet: outlet, goal: goal, sum: result.sum });
              this.masterSales.sort((a, b) => a.outlet.outletName.localeCompare(b.outlet.outletName));
            }
            );
        }
      });
  }

  getEarnings(goal, forMaster, outlet) {
    this.hawkerAnalytics.retrieveHawkerEarningsByOutletIdForSpecificPeriod(outlet._id, goal.goalStartDate, goal.goalEndDate)
      .subscribe(result => {
        const prevDate = this.getPrevStartAndEndDate(goal);
        if (result.length === 0) {
          if (!forMaster) {
            this.actualEarnings = 0;
            this.earningsTarget = {
              ...this.earningsTarget,
              color: '#FC100D'
            };

            this.hawkerAnalytics.retrieveHawkerEarningsByOutletIdForSpecificPeriod(outlet._id, prevDate.prevStartDate, prevDate.prevEndDate)
              .subscribe(retrievedResults => {
                if (retrievedResults.length !== 0) {
                  this.earningsTarget = {
                    ...this.earningsTarget,
                    prevEarnings: retrievedResults[0].earnings
                  };
                } else {
                  this.earningsTarget = {
                    ...this.earningsTarget,
                    prevEarnings: 0
                  };
                }
              });
          } else {
            goal = {
              ...goal,
              color: '#FC100D'
            };

            this.hawkerAnalytics.retrieveHawkerEarningsByOutletIdForSpecificPeriod(outlet._id, prevDate.prevStartDate, prevDate.prevEndDate)
              .subscribe(retrievedResults => {
                if (retrievedResults.length !== 0) {
                  goal = {
                    ...goal,
                    prevEarnings: retrievedResults[0].earnings
                  };
                } else {
                  goal = {
                    ...goal,
                    prevEarnings: 0
                  };
                }
                this.masterEarnings.push({ outlet: outlet, goal: goal, earnings: 0 });
                this.masterEarnings.sort((a, b) => a.outlet.outletName.localeCompare(b.outlet.outletName));
              });
          }
        }

        if (result.length !== 0) {
          if (!forMaster) {
            this.actualEarnings = result[0].earnings;
            if ((this.actualEarnings / goal.targetAmount) * 100 < 25) {
              this.earningsTarget = {
                ...this.earningsTarget,
                color: '#FC100D'
              };
            } else if ((this.actualEarnings / goal.targetAmount) * 100 >= 25 &&
              (this.actualEarnings / goal.targetAmount) * 100 <= 75) {
              this.earningsTarget = {
                ...this.earningsTarget,
                color: '#FF8B00'
              };
            } else if ((this.actualEarnings / goal.targetAmount * 100) > 75) {
              this.earningsTarget = {
                ...this.earningsTarget,
                color: '#4BB543'
              };
            }

            this.hawkerAnalytics.retrieveHawkerEarningsByOutletIdForSpecificPeriod(outlet._id, prevDate.prevStartDate, prevDate.prevEndDate)
              .subscribe(retrievedResults => {
                if (retrievedResults.length !== 0) {
                  this.earningsTarget = {
                    ...this.earningsTarget,
                    prevEarnings: retrievedResults[0].earnings
                  };
                } else {
                  this.earningsTarget = {
                    ...this.earningsTarget,
                    prevEarnings: 0
                  };
                }
              });
          } else {
            if ((result[0].earnings / goal.targetAmount) * 100 < 25) {
              goal = {
                ...goal,
                color: '#FC100D'
              };
            } else if ((result[0].earnings / goal.targetAmount) * 100 >= 25 &&
              (result[0].earnings / goal.targetAmount) * 100 <= 75) {
              goal = {
                ...goal,
                color: '#FF8B00'
              };
            } else if ((result[0].earnings / goal.targetAmount * 100) > 75) {
              goal = {
                ...goal,
                color: '#4BB543'
              };
            }
            this.hawkerAnalytics.retrieveHawkerEarningsByOutletIdForSpecificPeriod(outlet._id, prevDate.prevStartDate, prevDate.prevEndDate)
              .subscribe(retrievedResults => {
                if (retrievedResults.length !== 0) {
                  goal = {
                    ...goal,
                    prevEarnings: retrievedResults[0].earnings
                  };
                } else {
                  goal = {
                    ...goal,
                    prevEarnings: 0
                  };
                }
                this.masterEarnings.push({ outlet: outlet, goal: goal, earnings: result[0].earnings });
                this.masterEarnings.sort((a, b) => a.outlet.outletName.localeCompare(b.outlet.outletName));
              });
          }
        }
      });
  }

  async goToEditGoalModal(goal) {
    const modal = await this.modalController.create({
      component: EditGoalPage,
      cssClass: 'my-custom-class',
      componentProps: {
        outlet: this.outlet,
        goal: _.cloneDeep(goal),
        progress: (goal.goalCategory === GoalCategoryEnum.SALES) ? this.actualSales : this.actualEarnings
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        console.log(data.data);
        this.sessionService.setCurrentOutlet(data.data.outlet);
        this.outlet = data.data.outlet;

        if (this.outlet.isMaster) {
          for (let i = 0; i < this.hawker.outlets.length; i++) {
            if (this.hawker.outlets[i]._id === this.outlet._id) {
              this.hawker.outlets[i] = this.outlet;
              break;
            }
          }
          this.sessionService.setCurrentUser(this.hawker);
        }

        if (goal.goalCategory === GoalCategoryEnum.SALES) {
          this.salesTarget = data.data.goal;
          this.getNumOfSalesForGoal();
          if (this.outlet.isMaster) {
            this.getAllOutletsNumOfSales();
          }
        } else if (goal.goalCategory === GoalCategoryEnum.EARNINGS) {
          this.earningsTarget = data.data.goal;
          this.getEarningsForGoal();
          if (this.outlet.isMaster) {
            this.masterEarnings = [];
            this.getAllOutletsEarnings();
          }
        }

      }
    });
    return await modal.present();
  }

  isBefore(date) {
    return moment(date).isBefore(this.dateToday, 'day');
  }

  isAfter(date) {
    return moment(date).isAfter(this.dateToday, 'day');
  }

  isExpiredTarget(goal) {
    if (goal.goalPeriod === 'TARGETED') {
      if (this.isBefore(goal.goalEndDate)) {
        return true;
      }
    }
    return false;
  }

  getStartAndEndDate(goal) {
    switch (goal.goalPeriod) {
      case GoalPeriodEnum.DAILY:
        goal.goalStartDate = moment().startOf('day').toDate();
        goal.goalEndDate = moment().endOf('day').toDate();
        break;
      case GoalPeriodEnum.WEEKLY:
        goal.goalStartDate = moment().startOf('week').toDate();
        goal.goalEndDate = moment().endOf('week').toDate();
        break;
      case GoalPeriodEnum.MONTHLY:
        goal.goalStartDate = moment().startOf('month').toDate();
        goal.goalEndDate = moment().endOf('month').toDate();
        break;
      case GoalPeriodEnum.YEARLY:
        goal.goalStartDate = moment().startOf('year').toDate();
        goal.goalEndDate = moment().endOf('year').toDate();
        break;
      default:
        break;
    }
    return goal;
  }

  getPrevStartAndEndDate(goal) {
    let prevStartDate;
    let prevEndDate;
    switch (goal.goalPeriod) {
      case GoalPeriodEnum.DAILY:
        prevStartDate = moment().subtract(1, 'days').startOf('day').toDate();
        prevEndDate = moment().subtract(1, 'days').endOf('day').toDate();
        break;
      case GoalPeriodEnum.WEEKLY:
        prevStartDate = moment().subtract(1, 'weeks').startOf('week').toDate();
        prevEndDate = moment().subtract(1, 'weeks').endOf('week').toDate();
        break;
      case GoalPeriodEnum.MONTHLY:
        prevStartDate = moment().subtract(1, 'months').startOf('month').toDate();
        prevEndDate = moment().subtract(1, 'months').endOf('month').toDate();
        break;
      case GoalPeriodEnum.YEARLY:
        prevStartDate = moment().subtract(1, 'years').startOf('year').toDate();
        prevEndDate = moment().subtract(1, 'years').endOf('year').toDate();
        break;
      default:
        break;
    }
    return { prevStartDate: prevStartDate, prevEndDate: prevEndDate };
  }

  //GOAL MASTER
  changeView() {
    this.masterView = !this.masterView;
    if (this.masterView) {
      this.columnSize = 5;
    } else {
      this.columnSize = 4.7;
    }
  }

  getAllOutletsNumOfSales() {
    this.masterSales = [];
    for (const o of this.hawker.outlets) {
      if (o.goals.length === 0) {
        this.masterSales.push({ outlet: o, goal: null, sum: 0 });
        continue;
      } else {
        if (o.goals.length === 1) {
          if (o.goals[0].goalCategory !== GoalCategoryEnum.SALES) {
            this.masterSales.push({ outlet: o, goal: null, sum: 0 });
            continue;
          }
        }
        let goal = _.filter(o.goals, goal => goal.goalCategory === GoalCategoryEnum.SALES)[0];
        goal = this.getStartAndEndDate(goal);
        this.getNumOfSales(goal, true, o);
      }
    }
    this.getAllOutletsEarnings();
  }

  getAllOutletsEarnings() {
    for (const o of this.hawker.outlets) {
      if (o.goals.length === 0) {
        this.masterEarnings.push({ outlet: o, goal: null, earnings: 0 });
        continue;
      } else {
        if (o.goals.length === 1) {
          if (o.goals[0].goalCategory !== GoalCategoryEnum.EARNINGS) {
            this.masterEarnings.push({ outlet: o, goal: null, earnings: 0 });
            continue;
          }
        }
        let goal = _.filter(o.goals, goal => goal.goalCategory === GoalCategoryEnum.EARNINGS)[0];
        goal = this.getStartAndEndDate(goal);
        this.getEarnings(goal, true, o);
      }
    }
  }

  // COMPARATIVE
  getSalesLeaderboardRanking() {
    let day;

    switch (this.leaderboardSaleRankTypeCard) {
      case LeaderboardTimeFramesTypeEnum.LAST_7_DAYS:
        this.leaderboardSaleRankTypeCard = LeaderboardTimeFramesTypeEnum.LAST_30_DAYS;
        day = 30;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_30_DAYS:
        this.leaderboardSaleRankTypeCard = LeaderboardTimeFramesTypeEnum.LAST_60_DAYS;
        day = 60;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_60_DAYS:
        this.leaderboardSaleRankTypeCard = 'OVERALL';
        break;
      case 'OVERALL':
        this.leaderboardSaleRankTypeCard = LeaderboardTimeFramesTypeEnum.LAST_7_DAYS;
        day = 7;
        break;
      default:
        this.leaderboardSaleRankTypeCard = LeaderboardTimeFramesTypeEnum.LAST_7_DAYS;
        day = 7;
        break;
    }

    if (this.leaderboardSaleRankTypeCard === 'OVERALL') {
      this.leaderboardService.findNumOfSalesForAllHawkers().subscribe(
        allHawker => {
          const r = allHawker.map((hawker) => hawker._id).indexOf(this.outlet._id) + 1;
          if (r !== 0) {
            this.currentLeaderboardSaleRank = {
              rank: r,
              numOfSales: allHawker.filter((hawker) => hawker._id === this.outlet._id)[0].numOfSales
            };
          } else {
            this.currentLeaderboardSaleRank = {
              rank: -1,
              numOfSales: 0
            };
          }
        }
      );
      return;
    }
    this.leaderboardService.findNumOfSalesForAllHawkersForPastDays(day).subscribe(
      allHawkerPastDay => {
        const r = allHawkerPastDay.map((hawker) => hawker._id).indexOf(this.outlet._id) + 1;
        if (r !== 0) {
          this.currentLeaderboardSaleRank = {
            rank: r,
            numOfSales: allHawkerPastDay.filter((hawker) => hawker._id === this.outlet._id)[0].numOfSales
          };
        } else {
          this.currentLeaderboardSaleRank = {
            rank: -1,
            numOfSales: 0
          };
        }
      }
    );
  }

  updateGraph() {
    this.getSalesLeaderboardAnalyticsByCuisineTypeAndTimeFrame();
    this.getFoodItemSalesLeaderboardAnalytics();
  }

  //HAWKER COMPARATIVE ANALYTICS
  getSalesLeaderboardAnalyticsByCuisineTypeAndTimeFrame() {
    let day;
    switch (this.selectedTimeFrame) {
      case LeaderboardTimeFramesTypeEnum.LAST_7_DAYS:
        day = 7;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_30_DAYS:
        day = 30;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_60_DAYS:
        day = 60;
        break;
      default:
        break;
    }

    if (this.selectedTimeFrame === 'OVERALL') {
      this.leaderboardService.findNumOfSalesForAllHawkers().subscribe(
        allHawker => {
          this.actualHawkerSalesRank = allHawker;
          if (allHawker.length === 0) {
            return;
          }
          let filteredHawker;
          this.allHawkerSalesRank = [];

          const r = allHawker.map((hawker) => hawker._id).indexOf(this.outlet._id) + 1;
          if (r !== 0) {
            filteredHawker = allHawker.filter((x) => x.cuisineType.includes(this.selectedCuisineType));

            this.allHawkerSalesRank.push({
              xAxis: filteredHawker.map(a => a.outletName),
              data: [],
            });

            for (var i = 0; i < filteredHawker.length; i++) {
              this.allHawkerSalesRank[0].data.push((this.outlet._id === filteredHawker[i]._id) ? {
                name: filteredHawker[i]._id,
                value: filteredHawker[i].numOfSales,
                itemStyle: {
                  color: '#FF8B00'
                }
              } : {
                name: filteredHawker[i]._id,
                value: filteredHawker[i].numOfSales,
              }
              );
            }
          }
        }
      );
      return;
    }
    this.leaderboardService.findNumOfSalesForAllHawkersForPastDays(day).subscribe(
      allHawkerPastDay => {
        this.actualHawkerSalesRank = allHawkerPastDay;
        if (allHawkerPastDay.length === 0) {
          return;
        }
        let filteredHawker;
        this.allHawkerSalesRank = [];

        const r = allHawkerPastDay.map((hawker) => hawker._id).indexOf(this.outlet._id) + 1;
        if (r !== 0) {
          filteredHawker = allHawkerPastDay.filter((x) => x.cuisineType.includes(this.selectedCuisineType));

          this.allHawkerSalesRank.push({
            xAxis: filteredHawker.map(a => a.outletName),
            data: [],
          });

          for (var i = 0; i < filteredHawker.length; i++) {
            this.allHawkerSalesRank[0].data.push((this.outlet._id === filteredHawker[i]._id) ? {
              name: filteredHawker[i]._id,
              value: filteredHawker[i].numOfSales,
              itemStyle: {
                color: '#FF8B00'
              }
            } : {
              name: filteredHawker[i]._id,
              value: filteredHawker[i].numOfSales,
            }
            );
          }
        }
      }
    );
  }

  getFoodItemSalesLeaderboardAnalytics() {
    let day;
    switch (this.selectedTimeFrame) {
      case LeaderboardTimeFramesTypeEnum.LAST_7_DAYS:
        day = 7;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_30_DAYS:
        day = 30;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_60_DAYS:
        day = 60;
        break;
      default:
        break;
    }

    if (this.selectedTimeFrame === 'OVERALL') {
      this.leaderboardService.findNumOfSalesForAllFoodItem().subscribe(
        allFoodItem => {
          this.foodItemsRank = [];
          if (allFoodItem.length === 0) {
            return;
          }

          let filteredFoodItem = allFoodItem.filter((x) => x.outletType.includes(this.selectedCuisineType));
          if (filteredFoodItem.length === 0) {
            return;
          }
          //Segregate the outlet's and other food item
          const analysisItem = _.filter(filteredFoodItem, food => this.outlet.foodItems.some(item => item._id === food._id.foodItemId));
          const outletWithSimilarFoodName = [];
          const allNames = [];

          //Get all food item name in this outlet
          for (var i = 0; i < this.outlet.foodItems.length; i++) {
            if (!allNames.includes(this.outlet.foodItems[i].itemName)) {
              allNames.push(this.outlet.foodItems[i].itemName);
            }
          }
          this.allFoodItemName = allNames;
          if (analysisItem.length === 0) {
            outletWithSimilarFoodName.push({ outletId: this.outlet._id, outletName: this.outlet.outletName });
          }

          //Get outlet with the same food item name
          for (var i = 0; i < filteredFoodItem.length; i++) {
            if (!outletWithSimilarFoodName.some((x) => x.outletId === filteredFoodItem[i]._id.outletId)) {
              if (_.filter(this.allFoodItemName, x => x === filteredFoodItem[i].foodItemName).length === 1) {
                outletWithSimilarFoodName.push({ outletId: filteredFoodItem[i]._id.outletId, outletName: filteredFoodItem[i].outletName });
              }
            }
          }

          for (var i = 0; i < outletWithSimilarFoodName.length; i++) {
            let specificOutlet = _.filter(filteredFoodItem, x => x._id.outletId === outletWithSimilarFoodName[i].outletId);
            if (outletWithSimilarFoodName[i].outletId === this.outlet._id) {
              this.allFoodItemSalesRank[i] = {
                name: outletWithSimilarFoodName[i].outletName,
                type: 'bar',
                stack: 'x',
                id: outletWithSimilarFoodName[i].outletId,
                data: [],
                itemStyle: {
                  color: '#FF8B00'
                }
              };
            } else {
              this.allFoodItemSalesRank[i] = {
                name: outletWithSimilarFoodName[i].outletName,
                type: 'bar',
                id: outletWithSimilarFoodName[i].outletId,
                stack: 'x',
                data: []
              };
            }
            for (var j = 0; j < this.allFoodItemName.length; j++) {
              if (_.filter(specificOutlet, x => x.foodItemName === this.allFoodItemName[j]).length === 1) {
                const item = _.filter(specificOutlet, x => x.foodItemName === this.allFoodItemName[j]);
                this.allFoodItemSalesRank[i].data.push(item[0].numOfSales);
                this.foodItemsRank.push(item);
              } else {
                this.allFoodItemSalesRank[i].data.push(0);
              }
            }
          }
        }
      );
      return;
    }
    this.leaderboardService.findNumOfSalesForAllFoodItemForPastDays(day).subscribe(
      allFoodItemPastDay => {
        this.foodItemsRank = [];
        if (allFoodItemPastDay.length === 0) {
          return;
        }

        let filteredFoodItem = _.filter(allFoodItemPastDay, (x) => x.outletType.includes(this.selectedCuisineType));
        if (filteredFoodItem.length === 0) {
          return;
        }

        //Segregate the outlet's and other food item
        const analysisItem = _.filter(filteredFoodItem, food => this.outlet.foodItems.some(item => item._id === food._id.foodItemId));

        const outletWithSimilarFoodName = [];
        const allNames = [];


        //Get all food item name in this outlet
        for (var i = 0; i < this.outlet.foodItems.length; i++) {
          if (!allNames.includes(this.outlet.foodItems[i].itemName)) {
            allNames.push(this.outlet.foodItems[i].itemName);
          }
        }

        this.allFoodItemName = allNames;
        if (analysisItem.length === 0) {
          outletWithSimilarFoodName.push({ outletId: this.outlet._id, outletName: this.outlet.outletName });
        }

        //Get outlet with the same food item name
        for (var i = 0; i < filteredFoodItem.length; i++) {
          if (!outletWithSimilarFoodName.some((x) => x.outletId === filteredFoodItem[i]._id.outletId)) {
            if (_.filter(this.allFoodItemName, x => x === filteredFoodItem[i].foodItemName).length === 1) {
              outletWithSimilarFoodName.push({ outletId: filteredFoodItem[i]._id.outletId, outletName: filteredFoodItem[i].outletName });
            }
          }
        }

        const results = [];

        for (var i = 0; i < outletWithSimilarFoodName.length; i++) {
          let specificOutlet = _.filter(filteredFoodItem, x => x._id.outletId === outletWithSimilarFoodName[i].outletId);
          if (outletWithSimilarFoodName[i].outletId === this.outlet._id) {
            results[i] = {
              name: outletWithSimilarFoodName[i].outletName,
              type: 'bar',
              stack: 'x',
              id: outletWithSimilarFoodName[i].outletId,
              data: [],
              itemStyle: {
                color: '#FF8B00'
              }
            };
          } else {
            results[i] = {
              name: outletWithSimilarFoodName[i].outletName,
              type: 'bar',
              id: outletWithSimilarFoodName[i].outletId,
              stack: 'x',
              data: []
            };
          }
          for (var j = 0; j < this.allFoodItemName.length; j++) {
            if (_.filter(specificOutlet, x => x.foodItemName === this.allFoodItemName[j]).length === 1) {
              const item = _.filter(specificOutlet, x => x.foodItemName === this.allFoodItemName[j]);
              results[i].data.push(item[0].numOfSales);
              this.foodItemsRank.push(item);
            } else {
              results[i].data.push(0);
            }
          }
          this.allFoodItemSalesRank = results;
        }
      }
    );
  }


  getFavouritesLeaderboardRanking() {
    this.leaderboardService.findNumOfFavouritesForAllHawkers().subscribe(
      allHawkerFavourite => {
        const r = allHawkerFavourite.map((hawker) => hawker._id).indexOf(this.outlet._id) + 1;

        if (r !== 0) {
          this.currentLeaderboardFavouriteRank = {
            rank: r,
            numOfFavourites: allHawkerFavourite.filter((hawker) => hawker._id === this.outlet._id)[0].numOfSales
          };
        } else {
          this.currentLeaderboardFavouriteRank = {
            rank: -1,
            numOfFavourites: 0
          };
        }
      }
    );
  }

}
