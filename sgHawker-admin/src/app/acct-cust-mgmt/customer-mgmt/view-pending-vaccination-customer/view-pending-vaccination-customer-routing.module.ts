import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewPendingVaccinationCustomerPage } from './view-pending-vaccination-customer.page';

const routes: Routes = [
  {
    path: '',
    component: ViewPendingVaccinationCustomerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewPendingVaccinationCustomerPageRoutingModule {}
