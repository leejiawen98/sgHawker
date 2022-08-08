import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HawkerCenterDeliveryOrdersPageRoutingModule } from './hawker-center-delivery-orders-routing.module';

import { HawkerCenterDeliveryOrdersPage } from './hawker-center-delivery-orders.page';
import { RecommendedDeliveryModule } from '../recommended-delivery/recommended-delivery.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HawkerCenterDeliveryOrdersPageRoutingModule,
    RecommendedDeliveryModule,
  ],
  declarations: [HawkerCenterDeliveryOrdersPage]
})
export class HawkerCenterDeliveryOrdersPageModule {}
