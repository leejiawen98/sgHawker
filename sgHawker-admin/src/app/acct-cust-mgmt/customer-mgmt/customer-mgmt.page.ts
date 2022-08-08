import { ViewPendingVaccinationCustomerPage } from './view-pending-vaccination-customer/view-pending-vaccination-customer.page';
import { ToastController, ModalController } from '@ionic/angular';
import { CustomerAccountManagementService } from './../../services/customer-account-management.service';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { NavigationExtras, Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-customer-mgmt',
  templateUrl: './customer-mgmt.page.html',
  styleUrls: ['./customer-mgmt.page.scss'],
})
export class CustomerMgmtPage implements OnInit {

  allCustomers: User[];
  existVaccinationCert: string[];

  constructor(private customerAccountManagement: CustomerAccountManagementService,
    private router: Router, public toastController: ToastController,
    public modalController: ModalController) { }

  ngOnInit() {
    this.allCustomers = [];
    this.existVaccinationCert = [];
    this.retrieveAllCustomers();
  }

  ionViewWillEnter() {
    this.allCustomers = [];
    this.existVaccinationCert = [];
    this.retrieveAllCustomers();
    this.checkExistVaccinationCert();
  }

  retrieveAllCustomers() {
    this.customerAccountManagement.findAllCustomerAccounts().subscribe(
      retrievedUsers => {
        this.allCustomers = retrievedUsers;
      }
    )
  }

  goToDetailsPage(customer) {
    const navigationExtras: NavigationExtras = {
      state: {
        user: customer
      }
    };
    this.router.navigate(['customerAccountManagement/viewCustomerAccountDetails'], navigationExtras);
  }

  async viewPending() {
    const temp = _.cloneDeep(this.allCustomers);
    const notVaccinatedButExistDoc = temp.filter(x => this.existVaccinationCert.includes(x.email));
    const modal = await this.modalController.create({
      component: ViewPendingVaccinationCustomerPage,
      cssClass: 'my-custom-class',
      componentProps: {
        'customerArr': notVaccinatedButExistDoc,
      }
    });

    modal.onDidDismiss().then(async data => {
      this.allCustomers = [];
      this.existVaccinationCert = [];
      this.retrieveAllCustomers();
      this.checkExistVaccinationCert();
    });

    return await modal.present();
  }

  checkExistVaccinationCert() {
    this.customerAccountManagement.checkExistVaccinationCertNotVaccinated().subscribe(
      customersNotVaccinated => {
        this.existVaccinationCert = customersNotVaccinated;
      }
    )
  }


}
