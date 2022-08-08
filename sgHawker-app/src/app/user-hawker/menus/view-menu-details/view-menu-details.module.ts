import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewMenuDetailsPageRoutingModule } from './view-menu-details-routing.module';

import { ViewMenuDetailsPage } from './view-menu-details.page';
import { SynchroniseMenuModalComponent } from 'src/app/shared/synchronise-menu-modal/synchronise-menu-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewMenuDetailsPageRoutingModule
  ],
  declarations: [
    ViewMenuDetailsPage
  ]
})
export class ViewMenuDetailsPageModule {}
