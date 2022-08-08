import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FoodItemDetailsPage } from './food-item-details.page';

const routes: Routes = [
  {
    path: '',
    component: FoodItemDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoodItemDetailsPageRoutingModule {}
