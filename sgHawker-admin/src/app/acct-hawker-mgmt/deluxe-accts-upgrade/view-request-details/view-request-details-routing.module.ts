import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewRequestDetailsPage } from './view-request-details.page';

const routes: Routes = [
  {
    path: '',
    component: ViewRequestDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewRequestDetailsPageRoutingModule {}
