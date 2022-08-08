import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  },
  {
    path: 'account-details',
    loadChildren: () => import('./account-details/account-details.module').then( m => m.AccountDetailsPageModule)
  },
  {
    path: 'user-address',
    loadChildren: () => import('./user-address/user-address.module').then( m => m.UserAddressPageModule)
  },
  {
    path: 'digital-wallet',
    loadChildren: () => import('./digital-wallet/digital-wallet.module').then( m => m.DigitalWalletPageModule)
  },
  {
    path: 'view-reports',
    loadChildren: () => import('./view-reports/view-reports.module').then( m => m.ViewReportsPageModule)
  },
  {
    path: 'vaccination-record',
    loadChildren: () => import('./vaccination-record/vaccination-record.module').then( m => m.VaccinationRecordPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
