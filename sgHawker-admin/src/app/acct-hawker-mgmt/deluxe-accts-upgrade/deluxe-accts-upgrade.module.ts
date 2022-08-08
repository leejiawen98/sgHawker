import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeluxeAcctsUpgradePageRoutingModule } from './deluxe-accts-upgrade-routing.module';

import { DeluxeAcctsUpgradePage } from './deluxe-accts-upgrade.page';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeluxeAcctsUpgradePageRoutingModule,
    DataTablesModule
  ],
  declarations: [DeluxeAcctsUpgradePage]
})
export class DeluxeAcctsUpgradePageModule {}
