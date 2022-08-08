import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditGoalPageRoutingModule } from './edit-goal-routing.module';

import { EditGoalPage } from './edit-goal.page';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditGoalPageRoutingModule,
    ColorPickerModule
  ],
  declarations: [EditGoalPage]
})
export class EditGoalPageModule {}
