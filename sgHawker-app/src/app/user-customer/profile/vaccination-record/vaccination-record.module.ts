import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VaccinationRecordPageRoutingModule } from './vaccination-record-routing.module';

import { VaccinationRecordPage } from './vaccination-record.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VaccinationRecordPageRoutingModule
  ],
  declarations: [VaccinationRecordPage]
})
export class VaccinationRecordPageModule {}
