import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HawkerSubscriptionPage } from './hawker-subscription.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerSubscriptionPage
  },
  {
    path: 'adjust-subscription-fee-modal',
    loadChildren: () => import('./adjust-subscription-fee-modal/adjust-subscription-fee-modal.module').then( m => m.AdjustSubscriptionFeeModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerSubscriptionPageRoutingModule {}
