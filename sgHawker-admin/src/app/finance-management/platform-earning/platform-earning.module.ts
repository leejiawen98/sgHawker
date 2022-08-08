import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PlatformEarningPageRoutingModule } from './platform-earning-routing.module';
import { PlatformEarningPage } from './platform-earning.page';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlatformEarningPageRoutingModule,
    DataTablesModule
  ],
  declarations: [
    PlatformEarningPage
  ]
})
export class PlatformEarningPageModule { }
