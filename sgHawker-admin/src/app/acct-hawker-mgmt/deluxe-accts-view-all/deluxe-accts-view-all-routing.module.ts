import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeluxeAcctsViewAllPage } from './deluxe-accts-view-all.page';

const routes: Routes = [
  {
    path: '',
    component: DeluxeAcctsViewAllPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeluxeAcctsViewAllPageRoutingModule {}
