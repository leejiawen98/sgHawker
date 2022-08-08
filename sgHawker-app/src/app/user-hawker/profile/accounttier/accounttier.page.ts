import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountTierEnum } from 'src/app/models/enums/account-tier-enum.enum';
import { ToastController } from '@ionic/angular';
import { User } from '../../../models/user';
import { SessionService } from '../../../services/session.service';
import * as _ from 'lodash';
import { UserService } from 'src/app/services/user.service';
import { Outlet } from 'src/app/models/outlet';
import { Card } from 'src/app/models/submodels/card';
import { OutletService } from 'src/app/services/outlet.service';
import { Wallet } from 'src/app/models/wallet';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-accounttier',
  templateUrl: './accounttier.page.html',
  styleUrls: ['./accounttier.page.scss'],
})
export class AccounttierPage implements OnInit {

  hawker: User;
  creditCard: Card;
  masterOutlet: Outlet;
  currentOutlet: Outlet;
  currentWallet: Wallet;

  constructor(
    public sessionService: SessionService,
    public outletService: OutletService,
    public userService: UserService,
    private toastController: ToastController,
    private router: Router,
    private walletService: WalletService
    ) {}

  ngOnInit() { }

  ionViewWillEnter() {
    this.hawker = this.sessionService.getCurrentUser();
    this.currentOutlet = this.sessionService.getCurrentOutlet();
    this.walletService.findWalletByOwnerId(this.currentOutlet._id)
    .subscribe(wallet => {
      this.currentWallet = wallet;
      if (this.currentWallet) {
        if (this.currentWallet.subscriptionPaymentDue !== null) {
          this.userService.findAllCardsByCustomerId(this.hawker._id).subscribe(cards => {
            if (cards.find((x) => x.isDefault) !== undefined) {
              this.creditCard = cards.find((x) => x.isDefault);
            }
          });

        }
      }
    });

    if (this.hawker.accountTier === AccountTierEnum.DELUXE) {
      this.outletService.getHawkerOutlets(this.hawker._id).subscribe(
        res => {
          if (res.find((x) => x.isMaster) !== undefined) {
              this.masterOutlet = res.find((x) => x.isMaster);
            }
        }
      );
    }
  }

  changePlan() {
    if (this.currentWallet === null) {
      this.presentErrorToast('Please set up your digital wallet first');
    } else {
      this.router.navigate(['/hawker/profile/hawkertier/choose-plan']);
    }
  }

  async presentErrorToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }
}
