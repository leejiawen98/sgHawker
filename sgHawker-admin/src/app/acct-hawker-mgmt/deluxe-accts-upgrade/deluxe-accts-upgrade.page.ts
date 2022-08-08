import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { HawkerAccountManagementService } from 'src/app/services/hawker-account-management.service';
import { ViewRequestDetailsPage } from './view-request-details/view-request-details.page';
import * as _ from 'lodash';
@Component({
  selector: 'app-deluxe-accts-upgrade',
  templateUrl: './deluxe-accts-upgrade.page.html',
  styleUrls: ['./deluxe-accts-upgrade.page.scss'],
})
export class DeluxeAcctsUpgradePage implements OnInit {

  pendingUpgradeAccounts: User[] = [];
  dtOptions: any = {};

  constructor(
    private hawkerAccountManagementService: HawkerAccountManagementService,
    private toastController: ToastController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
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
    this.hawkerAccountManagementService.findAllPendingUpgradeHawkerAccounts()
      .subscribe(accounts => this.pendingUpgradeAccounts = accounts)
  }

  downloadDocuments(hawkerEmail) {
    this.hawkerAccountManagementService.downloadAccountUpgradeDocumentsAsZip(hawkerEmail)
      .subscribe(
        async data => {
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

  async showPendingRequestDetailsModal(hawker: User) {
    const modal = await this.modalController.create({
      component: ViewRequestDetailsPage,
      componentProps: {
        'hawker': hawker
      }
    })

    modal.onDidDismiss().then(data => {
      this.pendingUpgradeAccounts = _.filter(this.pendingUpgradeAccounts, account => account._id !== data.data);
    })
    await modal.present();
  }
}
