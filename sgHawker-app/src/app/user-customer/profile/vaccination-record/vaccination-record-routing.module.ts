import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VaccinationRecordPage } from './vaccination-record.page';

const routes: Routes = [
  {
    path: '',
    component: VaccinationRecordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VaccinationRecordPageRoutingModule {}
