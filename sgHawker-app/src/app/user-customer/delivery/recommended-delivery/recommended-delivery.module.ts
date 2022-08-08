import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllRecommendedDeliveryModalComponent } from './all-recommended-delivery-modal/all-recommended-delivery-modal.component';
import { RecommendedDeliveryCardComponent } from './recommended-delivery-card/recommended-delivery-card.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AllRecommendedDeliveryModalComponent,
    RecommendedDeliveryCardComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    AllRecommendedDeliveryModalComponent,
    RecommendedDeliveryCardComponent
  ]
})
export class RecommendedDeliveryModule { }
