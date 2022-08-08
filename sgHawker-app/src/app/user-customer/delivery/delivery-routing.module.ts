import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryPage } from './delivery.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryPage
  },
  {
    path: 'hawker-center-delivery-orders/:hawkerCenterName',
    loadChildren: () => import('./hawker-center-delivery-orders/hawker-center-delivery-orders.module').then( m => m.HawkerCenterDeliveryOrdersPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryPageRoutingModule {}
