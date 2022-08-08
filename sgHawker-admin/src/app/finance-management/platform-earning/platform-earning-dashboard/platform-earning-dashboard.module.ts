import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlatformEarningDashboardPageRoutingModule } from './platform-earning-dashboard-routing.module';
import { PlatformEarningDashboardPage } from './platform-earning-dashboard.page';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MultilineChartComponent } from './multiline-chart/multiline-chart.component';
import { PiechartComponent } from './piechart/piechart.component';
import { NumberCardComponent } from './number-card/number-card.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlatformEarningDashboardPageRoutingModule,
    NgxChartsModule,
    DataTablesModule
  ],
  declarations: [
    PlatformEarningDashboardPage,
    MultilineChartComponent,
    PiechartComponent,
    NumberCardComponent
  ]
})
export class PlatformEarningDashboardPageModule { }
