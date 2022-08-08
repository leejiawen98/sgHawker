import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DataTablesModule } from 'angular-datatables';

import { TransactionHistoryModalComponent } from './transaction-history-modal/transaction-history-modal.component';
import { PopoverComponent } from './popover/popover.component';
import { ReportDetailModalComponent } from './report-detail-modal/report-detail-modal.component';
import { OrderDetailModalComponent } from './order-detail-modal/order-detail-modal.component';
import { RefundDetailsModalComponent } from './refund-details-modal/refund-details-modal.component';
@NgModule({
  declarations: [
    PopoverComponent,
    TransactionHistoryModalComponent,
    ReportDetailModalComponent,
    OrderDetailModalComponent,
    RefundDetailsModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    DataTablesModule,
    FormsModule
  ],
  exports: [
    PopoverComponent,
    TransactionHistoryModalComponent,
    ReportDetailModalComponent,
    OrderDetailModalComponent,
    RefundDetailsModalComponent
  ]
})
export class SharedModule { }
