import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewRequestDetailsPageRoutingModule } from './view-request-details-routing.module';

import { ViewRequestDetailsPage } from './view-request-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewRequestDetailsPageRoutingModule
  ],
  declarations: [ViewRequestDetailsPage]
})
export class ViewRequestDetailsPageModule {}
