import { FooditemComparisonPage } from './fooditem-comparison/fooditem-comparison.page';
import { SessionService } from './../../../services/session.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FoodItemService } from 'src/app/services/food-item.service';
import * as _ from 'lodash';
import { LoadingController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-echarts-comparative-fooditem-chart',
  templateUrl: './echarts-comparative-fooditem-chart.component.html',
  styleUrls: ['./echarts-comparative-fooditem-chart.component.scss'],
})
export class EchartsComparativeFooditemChartComponent implements OnInit, OnChanges {

  @Input() allFoodRank;
  @Input() results;
  @Input() names;
  options: any;
  updateOptions: any;
  isSelected: any;
  currentOutlet: any;
  notExistingFoodItem: any;
  isLoading: any;

  constructor(
    private sessionService: SessionService,
    private foodItemService: FoodItemService,
    public modalController: ModalController,
    public loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.currentOutlet = this.sessionService.getCurrentOutlet();
    this.present();
    this.generateFoodItemComparativeGraph();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.results || changes.names || changes.allFoodRank) {
      this.generateFoodItemComparativeGraph();
    }
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

  generateFoodItemComparativeGraph() {
    this.updateOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {},
      grid: {
        bottom: 45
      },
      dataZoom: {
        type: 'inside',
      },
      xAxis: {
        name: 'No. of Sales for Food Item',
        type: 'value',
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: {
        // name: 'Food Item',
        // nameLocation: 'middle',
        // nameGap: 110,
        scale: true,
        data: this.names,
        type: 'category',
        axisTick: {
          alignWithLabel: true
        }
      },
      series: this.results
    };
    this.dismiss();
  }

  onClickBar(event: any, type: string) {
    const selfFoodItem = _.filter(this.allFoodRank, x => x[0]._id.outletId === this.currentOutlet._id && x[0].foodItemName === event.name);
    if (event.seriesId !== this.currentOutlet._id) {
      this.foodItemService.findAllFoodItemByOutletId(event.seriesId).subscribe(
        async retrievedFoodItems => {
          const foodItem = retrievedFoodItems.filter((x) => x.itemName === event.name)[0];
          const currentFoodItem = _.filter(this.currentOutlet.foodItems, x => x.itemName === event.name)[0];
          const modal = await this.modalController.create({
            component: FooditemComparisonPage,
            cssClass: 'fooditem-comparison-modal-css',
            componentProps: {
              'foodItem': { ...foodItem, numOfSales: event.data, outletName: event.seriesName },
              'currentFoodItem': (selfFoodItem.length !== 0) ? { ...currentFoodItem, numOfSales: selfFoodItem[0][0].numOfSales, outletName: selfFoodItem[0][0].outletName }
                                  : { ...currentFoodItem, numOfSales: 0, outletName: this.currentOutlet.outletName }
            }
          });
          return await modal.present();
        }
      );
    }
  }
}
