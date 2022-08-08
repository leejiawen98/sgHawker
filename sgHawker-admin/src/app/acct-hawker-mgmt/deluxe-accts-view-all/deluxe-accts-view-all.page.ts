import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { HawkerAccountManagementService } from 'src/app/services/hawker-account-management.service';

@Component({
  selector: 'app-deluxe-accts-view-all',
  templateUrl: './deluxe-accts-view-all.page.html',
  styleUrls: ['./deluxe-accts-view-all.page.scss'],
})
export class DeluxeAcctsViewAllPage implements OnInit {

  approvedUpgradeAccounts: User[] = [];
  dtOptions: any = {};


  constructor(
    private hawkerAccountManagementService: HawkerAccountManagementService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: ['excel'],
      paging: false,
      aoColumnDefs: [{ bSortable: false, aTargets: [5] }]
    };
  }

  ionViewWillEnter() {
    this.hawkerAccountManagementService.findAllApprovedUpgradeHawkerAccounts()
    .subscribe(accounts => this.approvedUpgradeAccounts = accounts)
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

  goToDetailsPage(hawkerId) {
    this.router.navigateByUrl('/hawkerAccountUpgrade/viewApprovedHawkerAccountDetails/' + hawkerId);
  }
}
