import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { FoodSpendingsComponent } from '../profile/food-spendings/food-spendings.component';
import { DeliveryDemandComponent } from '../profile/delivery-demand/delivery-demand.component';
import { DeliveryEarningsComponent } from './delivery-earnings/delivery-earnings.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReactiveFormsModule } from '@angular/forms';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    RoundProgressModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    ProfilePageRoutingModule
  ],
  declarations: [
    ProfilePage,
    FoodSpendingsComponent,
    DeliveryDemandComponent,
    DeliveryEarningsComponent
  ], 
})
export class ProfilePageModule {}
