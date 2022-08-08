import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeluxeAcctsViewAllPageRoutingModule } from './deluxe-accts-view-all-routing.module';

import { DeluxeAcctsViewAllPage } from './deluxe-accts-view-all.page';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeluxeAcctsViewAllPageRoutingModule,
    DataTablesModule
  ],
  declarations: [DeluxeAcctsViewAllPage]
})
export class DeluxeAcctsViewAllPageModule {}
