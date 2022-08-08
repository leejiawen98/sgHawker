import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditGoalPage } from './edit-goal.page';

const routes: Routes = [
  {
    path: '',
    component: EditGoalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditGoalPageRoutingModule {}
