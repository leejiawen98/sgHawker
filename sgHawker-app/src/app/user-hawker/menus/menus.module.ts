import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { IonicModule } from '@ionic/angular';

import { MenusPageRoutingModule } from './menus-routing.module';

import { MenusPage } from './menus.page';
import { SynchroniseMenuModalComponent } from 'src/app/shared/synchronise-menu-modal/synchronise-menu-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenusPageRoutingModule
  ],
  declarations: [
    MenusPage,
    SynchroniseMenuModalComponent
  ]
})
export class MenusPageModule { }
