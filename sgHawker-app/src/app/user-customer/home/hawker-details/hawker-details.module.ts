import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HawkerDetailsPageRoutingModule } from './hawker-details-routing.module';
import { HawkerDetailsPage } from './hawker-details.page';
import { SharedModule } from '../../../shared/shared.module';
import { ViewCashbackModalComponent } from './view-cashback-modal/view-cashback-modal.component';

@NgModule({
  declarations: [
    HawkerDetailsPage,
    ViewCashbackModalComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    HawkerDetailsPageRoutingModule
  ],
})
export class HawkerDetailsPageModule { }
