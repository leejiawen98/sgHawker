import { FoodItemDetailsPage } from './food-item-details/food-item-details.page';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { LeaderboardTimeFramesTypeEnum } from 'src/app/models/enums/leaderboard-time-frames-enum.enum';
import { OutletService } from 'src/app/services/outlet.service';
import { UserService } from 'src/app/services/user.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Outlet } from 'src/app/models/outlet';
import * as moment from 'moment';
import { LeaderboardService } from 'src/app/services/leaderboard.service';

@Component({
  selector: 'app-hawker-comparative',
  templateUrl: './hawker-comparative.page.html',
  styleUrls: ['./hawker-comparative.page.scss'],
})
export class HawkerComparativePage implements OnInit, OnChanges {
    baseUrl = '/api';

  @Input() subHawkerDetails: any;
  @Input() currentHawker: any;
  @Input() dayFilter: string;

  selectedOutlet: Outlet;

  lineChartOption: any;
  lineChartFormat: any;
  currentOutletLineData: any;
  selectedOutletLineData: any;

  pieChartFormat: any;
  pieChartOption: any;
  selectedOutletPieChartData: any[];

  foodNotAvailableInCurrent: any[];

  differentFoodItem: any[];
  isLoading: any;

  constructor(public modalController: ModalController,
    private outletService: OutletService,
    private hawkerAnalytics: AnalyticsService,
    private leaderboardService: LeaderboardService,
    public loadingController: LoadingController) {}

  ngOnInit() {
    this.selectedOutletPieChartData = [];
    this.differentFoodItem = [];
    this.present();
    this.retrievedSelectedHawker();
    this.generateXLabel(this.dayFilter);
  }

  async present() {
    this.isLoading = true;
    return await this.loadingController.create({
      // duration: 5000,
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingController.dismiss();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentOutletLineData || changes.selectedOutletLineData || changes.selectedOutletPieChartData) {
      this.generateSalesPerDayLineChart();
    }

    if (changes.selectedOutletPieChartData) {
      this.generatePieChartData();
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  retrievedSelectedHawker() {
    this.outletService.getOutletDetails(this.subHawkerDetails._id).subscribe(
      retrievedOutlet => {
        this.selectedOutlet = retrievedOutlet;
        this.dismiss();
        this.generateLineData();
        this.generatePieChartData();
        this.getDifferentFoodItem();
      }
    );
  }

  generateXLabel(timeFilter) {

    let xLabel = [];
    let loopNum;

    switch (timeFilter) {
      case LeaderboardTimeFramesTypeEnum.LAST_7_DAYS:
        loopNum = 7;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_30_DAYS:
        loopNum = 30;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_60_DAYS:
        loopNum = 60;
        break;
      case "OVERALL":
        loopNum = 60;
        break;
      default:
        break;
    }
    xLabel.push([]);
    for (var i = 0; i < loopNum; i++) {
      xLabel[0].push(moment().subtract(i + 1, 'days').format('L').toString());
    }
    xLabel[0].sort();
    return xLabel;
  }



  generateSalesPerDayLineChart() {
    this.lineChartFormat = {
      renderer: 'svg',
      width: 700,
      height: 350,
    };
    this.lineChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none'
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
      legend: {},
      xAxis: {
        scale: true,
        type: 'category',
        data: this.generateXLabel(this.dayFilter)[0]
      },
      yAxis: {
        name: "Number of Sales",
        nameLocation: 'middle',
        nameGap: 40,
        type: 'value'
      },
      series: [
        this.currentOutletLineData,
        this.selectedOutletLineData
      ]
    };
  }
  generateLineData() {

    let startDate = new Date();
    let endDate = new Date();

    switch (this.dayFilter) {
      case LeaderboardTimeFramesTypeEnum.LAST_7_DAYS:
        startDate.setDate(endDate.getDate() - 7);
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_30_DAYS:
        startDate.setDate(endDate.getDate() - 30);
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_60_DAYS:
        startDate.setDate(endDate.getDate() - 60);
        break;
      case "OVERALL":
        startDate.setDate(endDate.getDate() - 60);
        break;
      default:
        break;
    }

    this.currentOutletLineData = {
      name: this.currentHawker.outletName,
      type: 'line',
      data: [],
      itemStyle: {
        color: '#FF8B00'
      }
    };

    this.selectedOutletLineData = {
      name: this.selectedOutlet.outletName,
      type: 'line',
      data: []
    };

    this.hawkerAnalytics.retrieveComparativeSalesAnalytics(this.currentHawker._id, startDate, endDate).subscribe(
      retrievedResult => {
        for (var i = 0; i < retrievedResult.sales.series.length; i++) {
          this.currentOutletLineData.data.push(retrievedResult.sales.series[i]);
        }
        this.generateSalesPerDayLineChart();
        // for(const re in retrievedResult.sales.series) {
        //   this.currentOutletSalesData.data.push(re.value);
        // }
      }
    );

    this.hawkerAnalytics.retrieveComparativeSalesAnalytics(this.selectedOutlet._id, startDate, endDate).subscribe(
      retrievedResult => {
        for (var i = 0; i < retrievedResult.sales.series.length; i++) {
          this.selectedOutletLineData.data.push(retrievedResult.sales.series[i]);
        }
        this.generateSalesPerDayLineChart();
      }
    );
  }

  generatePieChartData() {
    let day = 0;
    switch (this.dayFilter) {
      case LeaderboardTimeFramesTypeEnum.LAST_7_DAYS:
        day = 7;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_30_DAYS:
        day = 30;
        break;
      case LeaderboardTimeFramesTypeEnum.LAST_60_DAYS:
        day = 60;
        break;
      case "OVERALL":
        day = 60;
        break;
      default:
        break;
    }

    if (day === 0) {
      this.leaderboardService.findNumOfSalesForAllFoodItem().subscribe(
        allFoodItems => {
          const filteredData = allFoodItems.filter((x) => x._id.outletId === this.selectedOutlet._id);
          if (filteredData.length !== 0) {
            for (var i = 0; i < filteredData.length; i++) {
              this.selectedOutletPieChartData.push({
                name: filteredData[i].foodItemName,
                value: filteredData[i].numOfSales
              })
            }
          }
          this.generateSalesPieChart();
        }
      );
    } else {
      this.leaderboardService.findNumOfSalesForAllFoodItemForPastDays(day).subscribe(
        allFoodItems => {
          const filteredData = allFoodItems.filter((x) => x._id.outletId === this.selectedOutlet._id);
          if (filteredData.length !== 0) {
            for (var i = 0; i < filteredData.length; i++) {
              this.selectedOutletPieChartData.push({
                name: filteredData[i].foodItemName,
                value: filteredData[i].numOfSales
              })
            }
          }
          this.generateSalesPieChart();
        }
      );
    }

  }

  generateSalesPieChart() {
    this.pieChartFormat = {
      renderer: 'svg',
      width: 650,
      height: 230,
    };
    this.pieChartOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Sales',
          type: 'pie',
          radius: '90%',
          data: this.selectedOutletPieChartData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  getDifferentFoodItem() {
    this.differentFoodItem = this.selectedOutlet.foodItems.filter(
      (x) => !this.currentHawker.foodItems.some((y) => y.itemName === x.itemName));
  }

  async viewFoodItemDetails(selected) {
    const modal = await this.modalController.create({
      component: FoodItemDetailsPage,
      cssClass: 'fooditem-comparative-modal-css',
      componentProps: {
        'foodItem': selected
      }
    });
    return await modal.present();
  }

}
