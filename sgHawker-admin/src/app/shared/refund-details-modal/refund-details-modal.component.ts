import { WalletService } from './../../services/wallet.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { Wallet } from 'src/app/models/wallet';

@Component({
  selector: 'app-refund-details-modal',
  templateUrl: './refund-details-modal.component.html',
  styleUrls: ['./refund-details-modal.component.scss'],
})
export class RefundDetailsModalComponent implements OnInit {

  @Input() order: Order;
  @Input() wallets: Wallet[];

  toWalletArr: Wallet[];
  fromWallet: Wallet;
  toWallet: Wallet;
  debitedCashback: number;
  maxRefundAmount: number;
  fullRefund: boolean;
  partialRefundAmount: number;

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private walletService: WalletService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.debitedCashback = this.order.debitedCashback ? this.order.debitedCashback : 0;
    this.maxRefundAmount = this.debitedCashback + this.order.totalPrice;
    this.toWalletArr = [];
    this.fullRefund = undefined;
  }

  closeModal() {
    this.modalController.dismiss();
  }

  fromWalletOnChange() {
    if (this.fromWallet.balance < this.maxRefundAmount) {
      this.displayErrorAlert('Insufficient Fund', 'Wallet does not have sufficient fund for refund');
      this.fromWallet = undefined;
    } else {
      this.toWalletArr = this.wallets.filter(x => x._id !== this.fromWallet._id);
    }
  }

  fullRefundChange() {
    this.partialRefundAmount = undefined;
  }

  partialRefundAmountChange() {
    if (this.partialRefundAmount > this.maxRefundAmount) {
      this.partialRefundAmount = this.maxRefundAmount;
    }
    if (this.partialRefundAmount < 0) {
      this.partialRefundAmount = 0;
    }
  }

  resetSelections() {
    this.fromWallet = undefined;
    this.toWallet = undefined;
    this.toWalletArr = [];
  }

  processRefund() {
    if (this.toWallet === undefined
      || this.fromWallet === undefined
      || this.order === undefined
      || this.fullRefund === undefined
    ) {
      this.displayErrorAlert('Incomplete Fields', 'Please ensure that all required information are provided');
      return;
    }

    //FIXME: this condition does not work
    if (!this.fullRefund && this.partialRefundAmount) {
      this.displayErrorAlert('Incomplete Fields', 'Please ensure that all required information are provided');
      return;
    }

    const refundAmount = this.partialRefundAmount ? this.partialRefundAmount : this.maxRefundAmount;

    this.alertController.create({
      header: 'Are you sure?',
      message: `
      <p>Please confirm the <b>refund amount of $${refundAmount.toFixed(2)}</b></p>
      <p><b>From</b> ${this.fromWallet.user !== undefined ? this.fromWallet.user.name : this.fromWallet.outlet.outletName}&nbsp;&nbsp;($${this.fromWallet.balance.toFixed(2)})</p>
      <p><b>To</b> ${this.toWallet.user !== undefined ? this.toWallet.user.name : this.toWallet.outlet.outletName}&nbsp;&nbsp;($${this.toWallet.balance.toFixed(2)})</p>
      `,
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.walletService.refundForOrder(this.fromWallet, this.toWallet, refundAmount, this.order).subscribe(
              success => {
                this.displayToast('Refund success!');
                this.closeModal();
              },
              error => {
                this.displayToast(`Something went wrong: ${error}`);
                this.closeModal();
              }
            );
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(x => x.present());
  }

  private displayToast(message: string) {
    this.toastController.create({
      header: message,
      duration: 3000,
      position: 'bottom'
    }).then(x => x.present());
  };

  private displayErrorAlert(header: string, msg: string) {
    this.alertController.create({
      header: header,
      message: msg,
      buttons: [
        {
          text: 'Okay',
          role: 'cancel'
        }
      ]
    }).then(x => x.present());
  }
}
