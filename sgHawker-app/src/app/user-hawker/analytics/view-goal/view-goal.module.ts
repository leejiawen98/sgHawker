import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewGoalPageRoutingModule } from './view-goal-routing.module';

import { ViewGoalPage } from './view-goal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewGoalPageRoutingModule
  ],
  declarations: [ViewGoalPage]
})
export class ViewGoalPageModule {}
