import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeliveryPageRoutingModule } from './delivery-routing.module';
import { DeliveryPage } from './delivery.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { RecommendedDeliveryModule } from './recommended-delivery/recommended-delivery.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryPageRoutingModule,
    SharedModule,
    RecommendedDeliveryModule,
  ],
  declarations: [
    DeliveryPage,
  ],
})
export class DeliveryPageModule {}
