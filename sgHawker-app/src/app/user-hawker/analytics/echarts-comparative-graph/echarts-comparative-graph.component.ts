import { HawkerComparativePage } from './hawker-comparative/hawker-comparative.page';
import { SessionService } from './../../../services/session.service';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Outlet } from 'src/app/models/outlet';
import { timingSafeEqual } from 'crypto';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-echarts-comparative-graph',
  templateUrl: './echarts-comparative-graph.component.html',
  styleUrls: ['./echarts-comparative-graph.component.scss'],
})
export class EchartsComparativeGraphComponent implements OnInit {

  @Input() results;
  @Input() timeFormat;
  @Input() actualRank;
  options: any;
  updateOptions: any;

  currentOutlet: Outlet;
  toShow: any[];

  colors: any[];

  constructor(private sessionService: SessionService,
              public modalController: ModalController) { }

  ngOnInit() {
    this.currentOutlet = this.sessionService.getCurrentOutlet();
      this.generateBarChartForComparativeSales();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.results) {
      this.generateBarChartForComparativeSales();
    }
  }

  generateBarChartForComparativeSales() {
      this.options = {
        width: 1300,
        height: 300,
      };
      this.updateOptions = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          }
        },
        dataZoom: {
          type: 'inside',
        },
        grid: {
          bottom: 45,
        },
        xAxis: {
          name: 'Outlet Name',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'category',
          scale: true,
          data: this.results[0].xAxis,
          axisTick: {
            alignWithLabel: true
          },
        },
        yAxis: {
          name: 'Number of Sales',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value'
        },
        series: [
          {
            data: this.results[0].data,
            type: 'bar',
          }
        ]
      };
  }

  async onClickBar(event: any, type: string) {
    if(event.name !== this.currentOutlet._id) {
      const currentOutletData = this.results[0].data.filter((x) => x.name === this.currentOutlet._id);
      const currentOutletRank = this.actualRank.findIndex((x) => x._id === this.currentOutlet._id) + 1;
      const selectedOutletRank = this.actualRank.findIndex((x) => x._id === event.name) + 1;

      const modal = await this.modalController.create({
        component: HawkerComparativePage,
        cssClass: 'fooditem-comparison-modal-css',
        componentProps: {
          'subHawkerDetails': {_id: event.name, numOfSales: event.value, ranking: selectedOutletRank},
          'currentHawker': {...this.currentOutlet, numOfSales: currentOutletData[0].value, ranking: currentOutletRank },
          'dayFilter': this.timeFormat
        }
      });
      return await modal.present();

    }
  }
}
