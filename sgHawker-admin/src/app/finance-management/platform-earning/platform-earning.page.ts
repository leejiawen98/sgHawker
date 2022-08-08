import { Router } from '@angular/router';
import { OrderService } from './../../services/order.service';
import { ModalController, AlertController } from '@ionic/angular';
import { WalletTransaction } from './../../models/walletTransaction';
import { SessionService } from './../../services/session.service';
import { WalletService } from './../../services/wallet.service';
import { Component, OnInit } from '@angular/core';
import { Wallet } from 'src/app/models/wallet';
import { OrderDetailModalComponent } from 'src/app/shared/order-detail-modal/order-detail-modal.component';
import { Order } from 'src/app/models/order';
import * as _ from 'lodash';
import * as moment from 'moment';
import { TransactionTypeEnum } from 'src/app/models/enums/transaction-type-enum';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-platform-earning',
  templateUrl: './platform-earning.page.html',
  styleUrls: ['./platform-earning.page.scss'],
})
export class PlatformEarningPage implements OnInit {

  adminWallet: Wallet;
  transactions: WalletTransaction[];
  dtOptions: any = {};

  showCurrentBalance: boolean;
  // filter
  showFilter: boolean;
  originalTransactions: WalletTransaction[];
  startDate: Date;
  endDate: Date;
  transactionCategory: string;
  transactionType: string;

  constructor(
    private walletService: WalletService,
    private sessionService: SessionService,
    private modalController: ModalController,
    private orderService: OrderService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.transactions = [];
    this.originalTransactions = [];
    this.transactionCategory = 'ALL';
    this.transactionType = 'ALL';

    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: [
        {
          text: 'View Dashboard',
          action: () => {
            this.router.navigate(['financeManagement/platformEarnings/platformEarningDashboard']);
          }
        },
        {
          text: 'Toggle Filter',
          action: () => {
            this.toggleFilter();
          }
        },
        {
          text: 'Toggle Platform Wallet',
          action: () => {
            this.toggleBalance();
          }
        },
        {
          text: 'Export Excel',
          action: () => {
            this.exportExcel();
          }
        },
      ],
      aoColumnDefs: [{ bSortable: false, aTargets: [7] }]
    };
  }

  ionViewWillEnter() {
    this.walletService.findWalletByOwnerId(this.sessionService.getCurrentUser()._id).subscribe(wallet => {
      this.adminWallet = wallet;
      this.transactions = wallet.walletTransactions;
      this.originalTransactions = _.cloneDeep(this.transactions);
    })
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  toggleBalance() {
    this.showCurrentBalance = !this.showCurrentBalance;
  }

  resetAllFilters() {
    this.transactions = _.cloneDeep(this.originalTransactions);
    this.startDate = null;
    this.endDate = null;
    this.transactionCategory = 'ALL';
    this.transactionType = 'ALL';
  }

  transactionCategoryChanged(event) {
    this.transactionCategory = event.target.value;
  }

  transactionTypeChanged(event) {
    this.transactionType = event.target.value;
  }

  exportExcel() {
    let element = document.getElementById('transaction-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    // change ending column to column G
    ws['!ref'] = ws['!ref'].replace('H', 'G');
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${moment().format('DD/MM/YYYY HH:MM')}_platform_transactions.xlsx`);
  }

  private displayInvalidDateRangeAlert(message: string) {
    this.alertController.create({
      header: 'Invalid time range',
      message: message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    }).then(x => x.present());
  }

  filterRecords() {
    if ((this.startDate && !this.endDate) || (this.endDate && !this.startDate)) {
      this.displayInvalidDateRangeAlert('Provide both start date and end date');
      return;
    }

    if (this.startDate && this.endDate && moment(this.startDate).isAfter(moment(this.endDate))) {
      this.displayInvalidDateRangeAlert('Start date must be before end date');
      return;
    }

    let startDate;
    let endDate;

    if (this.startDate && this.endDate) {
      startDate = moment(this.startDate);
      endDate = moment(this.endDate);
    }

    this.transactions = this.originalTransactions.filter(transaction => {

      let transactionIsValid = true;

      // filter date range
      if (this.startDate && this.endDate) {
        transactionIsValid = moment(transaction.transactionDate).isBetween(startDate, endDate, 'days', '[]');
      }

      if (!transactionIsValid) {
        return false;
      }

      // filter transactionCategory
      if (this.transactionCategory !== 'ALL') {
        if (this.transactionCategory === 'CREDIT') {
          transactionIsValid = transaction.transactionType === TransactionTypeEnum.DELIVERY || transaction.transactionType === TransactionTypeEnum.SUBSCRIPTION_PAYMENT
        } else if (this.transactionCategory === 'DEBIT') {
          transactionIsValid = transaction.transactionType === TransactionTypeEnum.REFUND;
        }
      }

      if (!transactionIsValid) {
        return false;
      }

      // filter transaction type
      return this.transactionType === 'ALL' ? true : transaction.transactionType.toString() === this.transactionType;
    })
  }

  viewOrderDetails(order: Order) {
    this.orderService.findOrderByOrderId(order._id).subscribe(
      orderToShow => {
        this.modalController.create({
          component: OrderDetailModalComponent,
          componentProps: {
            order: orderToShow
          }
        }).then(x => x.present());
      },
      error => {
        this.alertController.create({
          header: 'Unable to retrieve order',
          message: 'Please try again later',
          buttons: [
            {
              text: 'Dismiss',
              role: 'cancel'
            }
          ]
        }).then(x => x.present());
      }
    )
  }

}
