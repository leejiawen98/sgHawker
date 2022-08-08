import { BankAccount } from './../../models/submodels/bankAccount';
import { TransactionTypeEnum } from './../../models/enums/transaction-type-enum';
import { WalletService } from './../../services/wallet.service';
import { WalletTransaction } from './../../models/walletTransaction';
import { ModalController, AlertController, ToastController, AlertInput } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import { Outlet } from 'src/app/models/outlet';
import { Wallet } from 'src/app/models/wallet';
import * as moment from 'moment';
import * as _ from 'lodash';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-transaction-history-modal',
  templateUrl: './transaction-history-modal.component.html',
  styleUrls: ['./transaction-history-modal.component.scss'],
})
export class TransactionHistoryModalComponent implements OnInit {

  @Input() outlet: Outlet | undefined;
  @Input() customer: User | undefined;
  @Input() transactionType: TransactionTypeEnum;
  @Input() paymentStatus: string;

  transactions: WalletTransaction[];
  originalTransactions: WalletTransaction[];
  wallet: Wallet;
  dtOptions: any = {};

  startDate: Date;
  endDate: Date;

  constructor(
    private modalController: ModalController,
    private walletService: WalletService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
  }

  ngOnInit() {
    this.dtOptions = {
      dom: 'Bfrtip',
      responsive: true,
      buttons: [
      ],
      paging: false,
      aoColumnDefs: [{ bSortable: false, aTargets: [2] }]
    };

    this.walletService.findWalletByOwnerId(this.outlet ? this.outlet._id : this.customer._id).subscribe(wallet => {
      this.filterTransactions(wallet);
    });
  }

  showBankWithdrawalAlert() {
    const bankAccount = this.outlet.hawkerAccount.bankAccounts?.filter(x => x.isDefault)[0];
    if (!bankAccount) {
      this.alertController.create({
        header: 'Unable to perform bank transfer',
        message: 'The outlet did not provide a bank account',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]
      }).then(x => x.present());
      return;
    } else if (this.wallet.balance <= 0) {
      this.alertController.create({
        header: 'Unable to perform bank transfer',
        message: 'There is no balance in the wallet',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]
      }).then(x => x.present());
      return;
    }

    this.alertController.create({
      header: 'Immediate Bank Transfer',
      message: 'Do you want to update the withdrawal status?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.bankTransfer(true, bankAccount);
          }
        },
        {
          text: 'No',
          handler: () => {
            this.bankTransfer(false, bankAccount);
          }
        }
      ]
    }).then(x => x.present());
  }

  closeModal() {
    this.modalController.dismiss();
  }

  resetDurationFilter() {
    this.transactions = _.cloneDeep(this.originalTransactions);
    this.startDate = null;
    this.endDate = null;
  }

  filterByDuration() {
    console.log(this.originalTransactions)
    if (moment(this.startDate).isAfter(moment(this.endDate))) {
      this.alertController.create({
        header: 'Invalid time range',
        message: 'Start date must be before end date',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]
      }).then(x => x.present());
      return;
    }
    let startDate = moment(this.startDate);
    let endDate = moment(this.endDate);
    this.transactions = this.originalTransactions.filter(transaction => moment(transaction.transactionDate).isBetween(startDate, endDate, 'days', '[]'))
  }

  chargeSubscriptionFeeForHawker() {
    if (this.outlet.wallet.subscriptionPaymentDue === 0) {
      this.showSubscriptionAlert('No subscription payment due', 'The subscription amount for next month will be automatically updated by the system at midnight');
      return;
    }
    if (this.transactionType === TransactionTypeEnum.SUBSCRIPTION_PAYMENT && this.paymentStatus === 'OVERDUE') {
      const months = [] as AlertInput[];
      let currMonth = moment().startOf('year')
      while (moment(currMonth).isBefore(moment())) {
        months.push({
          type: 'radio',
          value: currMonth,
          label: currMonth.format('MM/YYYY')
        });
        currMonth = moment(currMonth).add(1, "month");
      }

      this.alertController.create({
        header: 'Please select month for subscription payment',
        inputs: months,
        buttons: [
          {
            text: 'Continue',
            handler: (data) => {
              this.subscriptionPaymentAlert(data);
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      }).then(x => x.present());
      return;
    }
    this.subscriptionPaymentAlert();
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

  private subscriptionPaymentAlert(selectedDate?: any) {

    let formattedDate = moment();

    if (selectedDate && !selectedDate.isSame(moment().startOf('month'))) {
      formattedDate = moment(selectedDate).endOf('month');
    }

    const hawkerDefaultCard = this.outlet.hawkerAccount.cards.filter(card => card.isDefault === true)[0];

    if (hawkerDefaultCard === undefined) {
      this.showSubscriptionAlert('Oops', 'Hawker does not have a default credit card.');
      return;
    } else {
      this.alertController.create({
        header: 'Are you sure you want to charge subscription fee?',
        message: `
        <p>Subscription fee: $${this.outlet.wallet.subscriptionPaymentDue.toFixed(2)}
        `,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Confirm',
            handler: () => {
              this.walletService.debitSubscriptionFeeByWalletId(this.outlet.wallet._id, formattedDate.toDate(), hawkerDefaultCard).subscribe(
                updatedWallet => {
                  this.showSubscriptionAlert('Success', 'Subscription fee is charged for ' + this.outlet.hawkerAccount.name)
                  this.modalController.dismiss({
                    wallet: updatedWallet
                  });
                },
                error => {
                  this.showSubscriptionAlert('Failure', error);
                }
              );
            }
          }
        ]
      }).then(x => x.present());
    }
  }

  private bankTransfer(setNewNextWithdrawalDate: boolean, bankAccount: BankAccount) {
    this.alertController.create({
      header: 'Are you sure you want to proceed with bank withdrawal?',
      message: `A total balance of $${this.wallet.balance} will be transferred to bank account number ${bankAccount.accountNumber}`,
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.walletService
              .debitFromWalletToBankAccount(this.wallet._id, bankAccount, setNewNextWithdrawalDate)
              .subscribe(
                updatedWallet => {
                  this.filterTransactions(updatedWallet);
                  this.toastController.create({
                    header: 'Bank transfer successful',
                    duration: 3000
                  }).then(x => x.present());
                },
                error => {
                  this.toastController.create({
                    header: 'Bank transfer failed!',
                    message: `${error}`,
                    duration: 3000
                  }).then(x => x.present());
                })
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(x => x.present())
  }

  private filterTransactions(wallet: Wallet) {
    this.wallet = wallet;

    if (wallet.walletTransactions !== undefined) {
      this.transactions = wallet.walletTransactions.filter(x => {
        if (this.transactionType === TransactionTypeEnum.ORDER && x.transactionType === TransactionTypeEnum.REFUND) {
          return true;
        }
        return this.transactionType === x.transactionType
      });
      this.originalTransactions = _.cloneDeep(this.transactions);
    }
  }
}
