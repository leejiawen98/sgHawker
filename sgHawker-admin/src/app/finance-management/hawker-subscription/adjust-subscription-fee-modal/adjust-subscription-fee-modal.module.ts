import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdjustSubscriptionFeeModalPageRoutingModule } from './adjust-subscription-fee-modal-routing.module';

import { AdjustSubscriptionFeeModalPage } from './adjust-subscription-fee-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdjustSubscriptionFeeModalPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AdjustSubscriptionFeeModalPage]
})
export class AdjustSubscriptionFeeModalPageModule {}
