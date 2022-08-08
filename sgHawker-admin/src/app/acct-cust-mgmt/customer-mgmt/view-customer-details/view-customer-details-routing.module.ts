import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewCustomerDetailsPage } from './view-customer-details.page';

const routes: Routes = [
  {
    path: '',
    component: ViewCustomerDetailsPage
  },
  {
    path: 'view-address',
    loadChildren: () => import('./view-address/view-address.module').then( m => m.ViewAddressPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewCustomerDetailsPageRoutingModule {}
