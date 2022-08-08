import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewPendingVaccinationCustomerPageRoutingModule } from './view-pending-vaccination-customer-routing.module';

import { ViewPendingVaccinationCustomerPage } from './view-pending-vaccination-customer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewPendingVaccinationCustomerPageRoutingModule
  ],
  declarations: [ViewPendingVaccinationCustomerPage]
})
export class ViewPendingVaccinationCustomerPageModule {}
