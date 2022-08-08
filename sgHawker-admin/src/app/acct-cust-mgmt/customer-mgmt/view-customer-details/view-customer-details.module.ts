import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewCustomerDetailsPageRoutingModule } from './view-customer-details-routing.module';

import { ViewCustomerDetailsPage } from './view-customer-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ViewCustomerDetailsPageRoutingModule
  ],
  declarations: [ViewCustomerDetailsPage]
})
export class ViewCustomerDetailsPageModule {}
