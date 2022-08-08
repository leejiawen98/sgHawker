import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerMgmtPage } from './customer-mgmt.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerMgmtPage
  },
  {
    path: 'viewCustomerAccountDetails',
    loadChildren: () => import('./view-customer-details/view-customer-details.module').then( m => m.ViewCustomerDetailsPageModule)
  },
  {
    path: 'view-pending-vaccination-customer',
    loadChildren: () => import('./view-pending-vaccination-customer/view-pending-vaccination-customer.module').then( m => m.ViewPendingVaccinationCustomerPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerMgmtPageRoutingModule {}
