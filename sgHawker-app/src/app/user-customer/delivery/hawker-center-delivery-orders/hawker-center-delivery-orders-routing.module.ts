import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HawkerCenterDeliveryOrdersPage } from './hawker-center-delivery-orders.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerCenterDeliveryOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerCenterDeliveryOrdersPageRoutingModule {}
