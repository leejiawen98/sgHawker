import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { number } from 'echarts';

@Component({
  selector: 'app-echarts-graph',
  templateUrl: './echarts-graph.component.html',
  styleUrls: ['./echarts-graph.component.scss'],
})
export class EchartsGraphComponent implements OnInit, OnChanges {
  @Input() results;
  @Input() xAxisLabel: string;
  @Input() yAxisLabel: string;
  @Input() chartTitle: string;
  @Input() chartType: 'LINE' | 'BAR' | 'PIE' = 'LINE';
  @Input() thresholdSliderTitle: string;
  @Input() thresholdTitle: string;
  // @Input() isMaster: boolean;
  updateOptions: any;
  options: any;

  showThreshold = false;
  threshold = 0;
  maxThreshold: number;
  belowThresholdItems: any[];

  hasData = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.xAxisLabel) {
      this.updateOptions = {
        xAxis: {
          name: this.xAxisLabel,
        },
      };
    }

    if (changes.yAxisLabel) {
      this.updateOptions = {
        yAxis: {
          name: this.yAxisLabel,
        },
      };
    }

    if (changes.results) {
      this.updateData();
    }

    if (changes.thresholdTitle) {
      this.showThreshold = !!this.thresholdTitle && !!this.thresholdSliderTitle;
    }
  }

  updateData() {
    if (!this.results) {
      this.hasData = false;
      return;
    }

    if (this.chartType === 'LINE' || this.chartType === 'BAR') {
      const formattedlegend = this.results.map((el) => el.name);
      let formattedAxis;
      let formattedSeries;
      if (this.chartType === 'LINE') {
        formattedAxis = this.results[0].series.map((el) => el.name);
        formattedSeries = this.results.map((el) => {
          const data = el.series.map((seriesEl) => Math.round((seriesEl.value) * 100) / 100);
          return {
            name: el.name,
            type: 'line',
            data,
          };
        });
        this.hasData = !formattedSeries.every(el => el.data.length === 0 || el.data.every(dataEl => dataEl === 0));
      } else if (this.chartType === 'BAR') {
        formattedAxis = [
          ...new Set(
            this.results
              .flatMap((resultEl) => resultEl.series)
              .map((seriesEl) => seriesEl.name)
          ),
        ] as Array<string>;
        formattedAxis.sort((a, b) => {
          const newA = parseFloat(a);
          const newB = parseFloat(b);
          if (isNaN(newA) || isNaN(newB)) {
            return a.localeCompare(b);
          }
          return newA - newB;
        });
        formattedSeries = this.results.map((el) => {
          const data = formattedAxis.map((foodItem) => {
            const foundItem = el.series.find(
              (seriesItem) => seriesItem.name === foodItem
            );
            const qtySold = foundItem ? foundItem.value : 0; // FIND HERE
            return qtySold;
          });

          return {
            name: el.name,
            type: 'bar',
            stack: 'foodItem',
            barWidth: 100,
            data,
          };
        });
        this.hasData = formattedSeries.some(el => el.data.length !== 0);
      }
      this.options = {
        ...this.options,
        series: formattedSeries,
        xAxis: {
          ...this.options?.xAxis,
          data: formattedAxis,
        },
        legend: {
          data: formattedlegend,
        },
      };
    } else if (this.chartType === 'PIE') {
      const formattedData = this.results.reduce(this.reducerForSeries, []);
      if (!formattedData || formattedData.length === 0) {
        this.hasData = false;
      } else {
        this.hasData = true;
      }
      this.options = {
        ...this.options,
        series: {
          type: 'pie',
          radius: '60%',
          data: formattedData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      };
    }
    if (
      this.showThreshold &&
      (this.chartType === 'LINE' || this.chartType === 'BAR')
    ) {
      this.setMaxThreshold();
    }
  }

  reducerForSeries = (arr, item) => {
    item.series.forEach((obj) => {
      const foundObj = arr.find((el) => el.name === obj.name);
      if (foundObj) {
        arr = arr.map((el) => {
          if (el.name === obj.name) {
            return {
              name: el.name,
              value: Math.round((el.value + obj.value) * 100) / 100,
            };
          }
          return el;
        });
      } else {
        arr.push(obj);
      }
    });
    return arr;
  };

  setMaxThreshold() {
    if (this.results && this.results.length > 0) {
      let values;
      if (this.chartType === 'LINE') {
        values = this.results.map((chartEl) => {
          const arrSum = chartEl.series.reduce(
            (acc, item) => acc + item.value,
            0
          );
          return Math.ceil(arrSum);
        });
      } else if (this.chartType === 'BAR') {
        values = this.results
          .reduce(this.reducerForSeries, [])
          .map((el) => el.value);
      }

      this.maxThreshold = Math.max.apply(Math, values);
    }
    if (this.maxThreshold < this.threshold) {
      this.threshold = this.maxThreshold;
    }
  }

  onThresholdChange() {
    if (this.chartType === 'LINE') {
      this.belowThresholdItems = this.results
        .filter((chartEl) => {
          const arrSum = chartEl.series.reduce(
            (arr, item) => arr + item.value,
            0
          );
          const foundBelowThreshold = arrSum < this.threshold;
          return foundBelowThreshold;
        })
        .map((el) => el.name);
    } else if (this.chartType === 'BAR') {
      const newArr = this.results.reduce(this.reducerForSeries, []);
      this.belowThresholdItems = newArr
        .filter((arr) => arr.value < this.threshold)
        .map((el) => el.name);
    }
  }

  get sliderTitle() {
    return this.thresholdSliderTitle.replace('_', this.threshold.toString());
  }

  ngOnInit() {
    this.showThreshold = !!this.thresholdTitle && !!this.thresholdSliderTitle;

    if (this.chartType === 'LINE' || this.chartType === 'BAR') {
      this.options = {
        tooltip: {
          trigger: 'axis',
        },
        // toolbox: {
        //   feature: {
        //     saveAsImage: {},
        //   },
        // },
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
        grid: {
          bottom: 100,
        },
        xAxis: {
          name: this.xAxisLabel,
          nameLocation: 'middle',
          nameGap: 40,
          scale: true,
          type: 'category',
        },
        yAxis: {
          name: this.yAxisLabel,
          nameLocation: 'middle',
          nameGap: 40,
        },
        series: [],
      };
    } else if (this.chartType === 'PIE') {
      this.options = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [],
      };
    }
  }
}
