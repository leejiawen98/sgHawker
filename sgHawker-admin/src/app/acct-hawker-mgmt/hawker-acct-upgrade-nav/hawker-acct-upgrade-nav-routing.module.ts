import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

import { HawkerAcctUpgradeNavPage } from './hawker-acct-upgrade-nav.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerAcctUpgradeNavPage,
    children: [
      {
        path: 'deluxeAcctsViewAll',
        loadChildren: () => import('../deluxe-accts-view-all/deluxe-accts-view-all.module').then( m => m.DeluxeAcctsViewAllPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'deluxeAcctsUpgrade',
        loadChildren: () => import('../deluxe-accts-upgrade/deluxe-accts-upgrade.module').then( m => m.DeluxeAcctsUpgradePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'viewApprovedHawkerAccountDetails/:id',
        loadChildren: () => import('../view-hawker-account-details/view-hawker-account-details.module').then(m => m.ViewHawkerAccountDetailsPageModule),
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerAcctUpgradeNavPageRoutingModule {}
