import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HawkerComparativePageRoutingModule } from './hawker-comparative-routing.module';

import { HawkerComparativePage } from './hawker-comparative.page';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HawkerComparativePageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  declarations: [HawkerComparativePage]
})
export class HawkerComparativePageModule {}
