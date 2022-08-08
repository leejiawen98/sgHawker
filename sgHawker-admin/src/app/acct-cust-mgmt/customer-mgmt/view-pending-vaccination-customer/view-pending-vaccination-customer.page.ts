import { CustomerAccountManagementService } from './../../../services/customer-account-management.service';
import { User } from './../../../models/user';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-view-pending-vaccination-customer',
  templateUrl: './view-pending-vaccination-customer.page.html',
  styleUrls: ['./view-pending-vaccination-customer.page.scss'],
})
export class ViewPendingVaccinationCustomerPage implements OnInit {

  @Input() customerArr: User[];

  textAfterButton: string[];

  constructor(public modalController: ModalController,
    private customerAccountManagement: CustomerAccountManagementService,
    public toastController: ToastController) { }

  ngOnInit() {
    this.textAfterButton = [];
  }

  dismissModal() {
    this.modalController.dismiss();
    this.customerArr = [];
    this.textAfterButton = [];
  }

  downloadVaccinationCert(customer: User) {
    this.customerAccountManagement
      .downloadVaccinationCert(customer.email)
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
        });
  }

  approveVaccinationCert(customer: User, index: number) {
    this.customerAccountManagement.updateCustomerVaccinationStatus(customer._id, true).subscribe(
      approvedCustomer => {
        this.toastController.create({
          message: 'Vaccination Certificate Approved.',
          duration: 2000,
        }).then(x => x.present());
        this.customerArr = this.customerArr.filter(x => x._id !== approvedCustomer._id)
      },
      error => {
        this.toastController.create({
          message: 'Something went wrong!' + error,
          duration: 2000,
        }).then(x => x.present());
      }
    )
  }

  rejectVaccinationCert(customer: User, index) {
    this.customerAccountManagement.rejectCustomerUploadedVacCert(customer).subscribe(
      rejectedCustomer => {
        this.toastController.create({
          message: 'Vaccination Certificate Rejected.',
          duration: 2000,
        }).then(x => x.present());
        this.textAfterButton[index] = 'Vaccination Certificate rejected';
      },
      error => {
        this.toastController.create({
          message: 'Something went wrong!' + error,
          duration: 2000,
        }).then(x => x.present());
      }
    )
  }

}
