import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReportManagementPageRoutingModule } from './report-management-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { ReportManagementPage } from './report-management.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportManagementPageRoutingModule,
    DataTablesModule,
    SharedModule
  ],
  declarations: [ReportManagementPage]
})
export class ReportManagementPageModule {}
