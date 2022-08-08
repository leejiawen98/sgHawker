import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HawkerComparativePage } from './hawker-comparative.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerComparativePage
  },
  {
    path: 'food-item-details',
    loadChildren: () => import('./food-item-details/food-item-details.module').then( m => m.FoodItemDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerComparativePageRoutingModule {}
