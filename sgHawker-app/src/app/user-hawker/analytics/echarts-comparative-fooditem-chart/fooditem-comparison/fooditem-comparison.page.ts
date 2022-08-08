import { FoodItem } from './../../../../models/foodItem';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-fooditem-comparison',
  templateUrl: './fooditem-comparison.page.html',
  styleUrls: ['./fooditem-comparison.page.scss'],
})
export class FooditemComparisonPage implements OnInit {

  @Input() foodItem: any;
  @Input() currentFoodItem: any;

  updateOptions: any;
  options: any;
  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {
    this.generateDoughnutChart();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  generateDoughnutChart() {
    this.updateOptions = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '3%',
        left: 'center'
      },
      series: [
        {
          name: 'Number Of Sales',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '12',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: this.foodItem.numOfSales, name: this.foodItem.outletName },
            { value: this.currentFoodItem.numOfSales, name: this.currentFoodItem.outletName, itemStyle: { color: "#FF8B00"} }
          ]
        }
      ]
    };
  }

}
