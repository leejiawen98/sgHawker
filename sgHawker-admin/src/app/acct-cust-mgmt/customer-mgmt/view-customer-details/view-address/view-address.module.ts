import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewAddressPageRoutingModule } from './view-address-routing.module';

import { ViewAddressPage } from './view-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewAddressPageRoutingModule
  ],
  declarations: [ViewAddressPage]
})
export class ViewAddressPageModule {}
