import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewGoalPage } from './view-goal.page';

const routes: Routes = [
  {
    path: '',
    component: ViewGoalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewGoalPageRoutingModule {}
