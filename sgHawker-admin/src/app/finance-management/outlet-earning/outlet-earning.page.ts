import { Wallet } from './../../models/wallet';
import { TransactionTypeEnum } from './../../models/enums/transaction-type-enum';
import { TransactionHistoryModalComponent } from '../../shared/transaction-history-modal/transaction-history-modal.component';
import { ModalController } from '@ionic/angular';
import { OutletService } from 'src/app/services/outlet.service';
import { Component, OnInit } from '@angular/core';
import { Outlet } from 'src/app/models/outlet';
import * as moment from 'moment';

@Component({
  selector: 'app-outlet-earning',
  templateUrl: './outlet-earning.page.html',
  styleUrls: ['./outlet-earning.page.scss'],
})
export class OutletEarningPage implements OnInit {

  outlets: Outlet[];
  dtOptions: any = {};

  constructor(
    private outletService: OutletService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.outlets = [];
    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: [],
      paging: false,
      aoColumnDefs: [{ bSortable: false, aTargets: [5] }]
    };
  }

  ionViewWillEnter() {
    this.outletService.findAllActiveOutlets().subscribe(outlets => {
      this.outlets = outlets.filter(x => x.wallet);
    });
  }

  withdrawalStatus(wallet: Wallet): string {
    const currentDate = moment();
    const withdrawalTransactions = wallet.walletTransactions.filter(txn => txn.transactionType === TransactionTypeEnum.WITHDRAWAL);

    if (!wallet.nextWithdrawalDate) {
      return '-';
    }

    //has withdrawal date, and the withdrawal date is after current date,
    if (wallet.nextWithdrawalDate && moment(wallet.nextWithdrawalDate).isAfter(currentDate)) {
      return 'PENDING';
    }

    //has withdrawal date, and the withdrawal date is before current date,
    if (wallet.nextWithdrawalDate && moment(wallet.nextWithdrawalDate).isBefore(currentDate)) {
      return 'OVERDUE';
    }
    
    return '-';
  }

  totalOutletEarnings() {
    return this.outlets.map(x => x.wallet.balance).reduce((sum, current) => sum + current);
  }

  async showTransactionHistoryModal(outlet: Outlet) {
    const modal = this.modalController.create({
      component: TransactionHistoryModalComponent,
      cssClass: 'transaction-history-modal',
      componentProps: {
        outlet: outlet,
        transactionType: TransactionTypeEnum.WITHDRAWAL
      }
    });

    (await modal).present();
  }

}
