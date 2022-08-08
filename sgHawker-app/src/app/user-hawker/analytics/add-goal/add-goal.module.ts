import { ColorPickerModule } from 'ngx-color-picker';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddGoalPageRoutingModule } from './add-goal-routing.module';

import { AddGoalPage } from './add-goal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddGoalPageRoutingModule,
    ColorPickerModule
  ],
  declarations: [AddGoalPage]
})
export class AddGoalPageModule {}
