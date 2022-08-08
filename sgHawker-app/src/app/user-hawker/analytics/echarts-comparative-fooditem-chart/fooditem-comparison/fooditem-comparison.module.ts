import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FooditemComparisonPageRoutingModule } from './fooditem-comparison-routing.module';

import { FooditemComparisonPage } from './fooditem-comparison.page';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FooditemComparisonPageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  declarations: [FooditemComparisonPage]
})
export class FooditemComparisonPageModule {}
