import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdjustSubscriptionFeeModalPage } from './adjust-subscription-fee-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AdjustSubscriptionFeeModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdjustSubscriptionFeeModalPageRoutingModule {}
