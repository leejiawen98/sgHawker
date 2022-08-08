import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';

import { ReportManagementPage } from './report-management.page';

const routes: Routes = [
  {
    path: '',
    component: ReportManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportManagementPageRoutingModule {}
