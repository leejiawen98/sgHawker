import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';
import { Card } from 'src/app/models/submodels/card';
import { User } from 'src/app/models/user';
import { HawkerAccountManagementService } from 'src/app/services/hawker-account-management.service';
import { OutletService } from 'src/app/services/outlet.service';
import * as moment from 'moment';
import { AccountTierEnum } from 'src/app/models/enums/account-tier-enum.enum';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-view-request-details',
  templateUrl: './view-request-details.page.html',
  styleUrls: ['./view-request-details.page.scss'],
})
export class ViewRequestDetailsPage implements OnInit {

  @Input() hawker: User;

  masterOutlet: Outlet;
  creditCard: Card;
  subscriptionFees: any;

  hidden: boolean = true;

  constructor(
    private hawkerAccountManagementService: HawkerAccountManagementService,
    private toastController: ToastController,
    private outletService: OutletService,
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.outletService.findMasterOutletsByHawkerId(this.hawker._id)
      .subscribe(mo => this.masterOutlet = mo);
    this.creditCard = this.hawker.cards.find(x => x.isDefault);
    this.userService.findSubscriptionFees()
      .subscribe(fees => this.subscriptionFees = fees)
  }

  findProratedSubscriptionFee() {
    const daysInCurrentMonth = moment().daysInMonth()
    const remainingDaysTillEndOfMonth = moment().endOf('month').diff(moment(), 'days');
    const daysUpTillNow = moment().endOf('month').date() - remainingDaysTillEndOfMonth;

    let newSubscriptionPaymentDue;
    switch (this.hawker.accountTier) {
      case AccountTierEnum.FREE:
        newSubscriptionPaymentDue = this.subscriptionFees.deluxe / daysInCurrentMonth * remainingDaysTillEndOfMonth;
        break;
      case AccountTierEnum.PREMIUM:
        newSubscriptionPaymentDue
          = this.subscriptionFees.premium / daysInCurrentMonth * daysUpTillNow
          + this.subscriptionFees.deluxe / daysInCurrentMonth * remainingDaysTillEndOfMonth;
    }
    return newSubscriptionPaymentDue;
  }

  downloadDocuments() {
    this.hawkerAccountManagementService.downloadAccountUpgradeDocumentsAsZip(this.hawker.email)
      .subscribe(
        data => {
          const blob = new Blob([data], {
            type: 'application/zip'
          });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
          this.toastController.create({
            message: 'Documents successfully downloaded!',
            duration: 2000,
          }).then(x => x.present());
        },
        error => {
          this.toastController.create({
            message: 'Something went wrong!' + error,
            duration: 2000,
          }).then(x => x.present());
        })
  }

  viewContact() {
    if (this.hidden) {
      this.hidden = false;
    } else {
      this.hidden = true;
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  approveRequest() {
    this.hawkerAccountManagementService.approveAccountUpgrade(this.hawker._id, AccountTierEnum.DELUXE, this.masterOutlet._id)
      .subscribe(res => {
        this.toastController.create({
          message: 'Account Upgrade Approved',
          duration: 2000,
        }).then(x => x.present());
        this.modalController.dismiss(this.hawker._id);
      },
        err => {
          this.toastController.create({
            message: 'An error has occurred. Please try again',
            duration: 2000,
          }).then(x => x.present());
        });
  }

  async rejectRequest() {
    const confirmPrompt = this.alertController.create({
      message: 'Do you want to reject?',
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            const alertInput = this.alertController.create({
              header: 'Reason of Rejecting Upgrade Request',
              inputs: [
                {
                  name: 'reason',
                  placeholder: 'Tell them why',
                },
              ],
              buttons: [
                {
                  text: 'OK',
                  handler: async (data) => {
                    this.hawkerAccountManagementService
                      .rejectAccountUpgrade(this.hawker._id, this.hawker.accountTier, this.masterOutlet, data.reason)
                      .subscribe((res: User) => {
                        this.toastController.create({
                          message: 'Upgrade Request to Deluxe Rejected',
                          duration: 2000,
                        }).then(x => x.present());
                      });
                    this.modalController.dismiss(this.hawker._id);
                  },
                },
                {
                  text: 'Cancel',
                  handler: () => {
                    return;
                  },
                },
              ],
            });
            (await alertInput).present();
          },
        },
        {
          text: 'No',
          handler: () => {
            return;
          },
        },
      ],
    });
    (await confirmPrompt).present();
  }
}
