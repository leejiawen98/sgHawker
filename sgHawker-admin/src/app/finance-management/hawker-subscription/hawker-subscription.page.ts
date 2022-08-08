import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TransactionTypeEnum } from 'src/app/models/enums/transaction-type-enum';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { OutletService } from 'src/app/services/outlet.service';
import { TransactionHistoryModalComponent } from 'src/app/shared/transaction-history-modal/transaction-history-modal.component';
import * as _ from 'lodash';
import { AdjustSubscriptionFeeModalPage } from './adjust-subscription-fee-modal/adjust-subscription-fee-modal.page';
import * as moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { AccountTierEnum } from 'src/app/models/enums/account-tier-enum.enum';
import { HawkerAccountManagementService } from 'src/app/services/hawker-account-management.service';

@Component({
  selector: 'app-hawker-subscription',
  templateUrl: './hawker-subscription.page.html',
  styleUrls: ['./hawker-subscription.page.scss'],
})
export class HawkerSubscriptionPage implements OnInit {

  dtOptions: any = {};
  outlets: Outlet[];
  originalOutlets: Outlet[];
  hawkerAccounts: User[];
  showFilter: boolean;
  accountTierType: string;
  paymentStatus: string;

  constructor(
    private outletService: OutletService,
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
    private hawkerAccountMgmtService: HawkerAccountManagementService
  ) {
    this.outlets = [];
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: [
        {
          text: 'Toggle Filter',
          action: () => {
            this.toggleFilter();
          }
        }
      ],
      paging: false,
    };

    this.getAllOutlets();

    this.accountTierType = 'ALL';
    this.paymentStatus = 'ALL';
  }

  getAllOutlets() {
    this.outletService.findAllActiveOutlets().subscribe(outlets => {
      this.outlets = outlets.filter(outlet => outlet.isDeleted === false);

      this.outlets = Array
        .from(new Set(outlets.map(o => o.hawkerAccount._id)))
        .map(id => outlets.find(o => o.hawkerAccount._id === id));

      this.outlets = this.outlets.filter(o => {
        if (o.hawkerAccount.accountTier !== AccountTierEnum.DELUXE && o.wallet.subscriptionPaymentDue > 0) {
          return true;
        } else if (o.hawkerAccount.accountTier === AccountTierEnum.PREMIUM) {
          return true;
        } else if (o.hawkerAccount.accountTier === AccountTierEnum.DELUXE && o.isMaster === true) {
          return true;
        }
        return false;
      });
      this.originalOutlets = _.cloneDeep(this.outlets);
    });
  }

  async showTransactionHistoryModal(outlet: Outlet) {
    let paymentStatus = '';

    if (outlet.wallet) {
      paymentStatus = this.checkSubscriptionFeeStatus(outlet);
    }

    const modal = await this.modalController.create({
      component: TransactionHistoryModalComponent,
      cssClass: 'transaction-history-modal',
      componentProps: {
        outlet: outlet,
        transactionType: TransactionTypeEnum.SUBSCRIPTION_PAYMENT,
        paymentStatus: paymentStatus
      },
      showBackdrop: true,
      backdropDismiss: false,
    });

    modal.onDidDismiss().then(data => {
      if (data.data != undefined) {
        this.getAllOutlets();
      }
    });

    await modal.present();
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  accountTierChanged(event) {
    this.accountTierType = event.target.value;
  }

  paymentStatusChanged(event) {
    this.paymentStatus = event.target.value;
  }

  filterSubscriptions() {
    this.outlets = this.originalOutlets.filter(outlet => {
      let subscriptionValid = true;
      // filter payment status
      subscriptionValid = this.paymentStatus === 'ALL' ? true : this.checkSubscriptionFeeStatus(outlet).toString() === this.paymentStatus;

      if (!subscriptionValid) {
        return false;
      }

      // filter hawker account tier
      return this.accountTierType === 'ALL' ? true : this.accountTierType === outlet.hawkerAccount.accountTier.toString();
    });
  }

  resetAllFilters() {
    this.outlets = _.cloneDeep(this.originalOutlets);
    this.accountTierType = 'ALL';
    this.paymentStatus = 'ALL';
  }

  async adjustSubscriptionFees() {
    const modal = await this.modalController.create({
      component: AdjustSubscriptionFeeModalPage,
      cssClass: 'adjust-subscription-modal',
      showBackdrop: true,
      backdropDismiss: false,
    });

    await modal.present();
  }

  checkSubscriptionFeeStatus(outlet: Outlet): string {
    const currentDate = moment();
    const subscriptionPaymentTransaction = outlet.wallet.walletTransactions.filter(txn => txn.transactionType === TransactionTypeEnum.SUBSCRIPTION_PAYMENT);
    // no subscription fee but current date is after the end of the month
    if (subscriptionPaymentTransaction.length <= 0 && currentDate.isAfter(moment().endOf('month').format('YYYY-MM-DD'))) {
      return 'OVERDUE';
    } else if (subscriptionPaymentTransaction.length <= 0) {
      return 'PENDING';
    }

    let latestSubscriptionPaymentTransactionDate;

    if (subscriptionPaymentTransaction.length > 0) {
      latestSubscriptionPaymentTransactionDate = subscriptionPaymentTransaction[0].transactionDate;
    }

    if (moment(latestSubscriptionPaymentTransactionDate).isBefore(moment().endOf('month').format('YYYY-MM-DD'))
      && moment(latestSubscriptionPaymentTransactionDate).isAfter(moment().startOf('month').format('YYYY-MM-DD'))) {
      return 'PAID';
    }

    // if latest subscription payment date is previous month -> havnt pay for current month, if not is overdue
    return moment(latestSubscriptionPaymentTransactionDate).month() === moment().month() - 1 ? 'PENDING' : 'OVERDUE'
  }

  async downgradeAccountTier(outlet: Outlet) {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to downgrade the account?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            const writtenInstruction = 'Account is downgraded due to overdue payment.';
            this.hawkerAccountMgmtService.rejectAccountUpgrade(outlet.hawkerAccount._id, AccountTierEnum.FREE, outlet, writtenInstruction).subscribe(
              user => {
                this.showSubscriptionAlert('Success', 'Account has been downgraded.');
                this.getAllOutlets();
              },
              error => {
                this.showSubscriptionAlert('Oops', error);
              }
            );
          }
        }
      ]
    });
    await alert.present();
  }

  async showSubscriptionAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ]
    });
    await alert.present();
  }

}
