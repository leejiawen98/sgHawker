import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewAddressPage } from './view-address.page';

const routes: Routes = [
  {
    path: '',
    component: ViewAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewAddressPageRoutingModule {}
