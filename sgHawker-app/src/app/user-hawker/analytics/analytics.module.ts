import { EchartsComparativeGraphComponent } from './echarts-comparative-graph/echarts-comparative-graph.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AnalyticsPageRoutingModule } from './analytics-routing.module';
import { AnalyticsPage } from './analytics.page';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgxEchartsModule } from 'ngx-echarts';
import { EchartsComparativeFooditemChartComponent } from './echarts-comparative-fooditem-chart/echarts-comparative-fooditem-chart.component';
import { EchartsGraphComponent } from './echarts-graph/echarts-graph.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalyticsPageRoutingModule,
    ColorPickerModule,
    RoundProgressModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  declarations: [
    AnalyticsPage,
    EchartsComparativeGraphComponent,
    EchartsComparativeFooditemChartComponent,
    EchartsGraphComponent
  ]
})
export class AnalyticsPageModule { }
