import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import * as _ from 'lodash';
import { Address } from 'src/app/models/submodels/address';
import { ViewAddressPage } from './view-address/view-address.page';
import { CustomerAccountManagementService } from './../../../services/customer-account-management.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AccountStatusEnum } from './../../../models/enums/account-status-enum.enum';

@Component({
  selector: 'app-view-customer-details',
  templateUrl: './view-customer-details.page.html',
  styleUrls: ['./view-customer-details.page.scss'],
})
export class ViewCustomerDetailsPage implements OnInit {
  baseUrl = "/api";
  customer: User;
  readOnly: boolean;
  currentStatus: string;
  customerAccountForm: FormGroup;
  currentAddress: Address[];
  changesMade: boolean;

  constructor(
    private router: Router,
    public alertController: AlertController,
    private customerAccountManagementService: CustomerAccountManagementService,
    public modalController: ModalController,
    public formBuilder: FormBuilder,
    public toastController: ToastController) {
    this.customer = this.router.getCurrentNavigation().extras.state.user;

    if (!this.customer.isVaccinated) {
      this.customer.isVaccinated = false;
    }

    this.customerAccountForm = formBuilder.group({
      name: [this.customer.name, Validators.compose([Validators.maxLength(100), Validators.required])],
      email: [this.customer.email, Validators.compose([Validators.maxLength(70), Validators.pattern('^[a-zA-Z0-9._]+[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'), Validators.required])],
      phone: [this.customer.phone, Validators.compose([Validators.maxLength(8), Validators.required, Validators.pattern('[0-9]*')])],
      accountStatus: [this.customer.accountStatus, Validators.required],
      isVaccinated: [this.customer.isVaccinated, Validators.required],
    });
  }

  edit() {
    this.readOnly = false;
  }

  ngOnInit() {
    this.readOnly = true;
    this.currentAddress = _.cloneDeep(this.customer.addresses);
    this.changesMade = false;
  }

  cancel() {
    this.reset();
    this.readOnly = true;
  }

  reset() {
    this.customerAccountForm.setValue({
      name: this.customer.name,
      email: this.customer.email,
      phone: this.customer.phone,
      accountStatus: this.customer.accountStatus
    });
    this.customer.addresses = this.currentAddress;
    this.changesMade = false;
  }

  async updateAccountStatus() {
    if (this.customerAccountForm.valid) {
      this.customer.name = this.customerAccountForm.value.name;
      this.customer.email = this.customerAccountForm.value.email;
      this.customer.phone = this.customerAccountForm.value.phone;
      this.customer.isVaccinated = this.customerAccountForm.value.isVaccinated;
      this.customer.addresses = this.currentAddress;

      this.customerAccountManagementService.updateCustomerAccount(this.customer).subscribe(
        async cust => {
          console.log(cust)
          //Status IS active
          if (this.customerAccountForm.value.accountStatus !== this.customer.accountStatus && this.customerAccountForm.value.accountStatus === AccountStatusEnum.ACTIVE) {
            this.customerAccountManagementService.activateCustomerAccount(this.customer._id).subscribe(
              async customer => {
                console.log(customer)
                this.customer = customer;
                const alert = await this.alertController.create({
                  cssClass: 'my-custom-class',
                  header: 'Success',
                  message: 'Customer detail has been updated.',
                  buttons: [
                    {
                      text: 'Ok',
                      handler: () => {
                        this.customer = customer;
                        this.currentAddress = _.cloneDeep(customer.addresses);
                        this.readOnly = true;
                        return;
                      }
                    }
                  ]
                });
                await alert.present();
              }
            )
            //Status IS suspended
          } else if (this.customerAccountForm.value.accountStatus !== this.customer.accountStatus && this.customerAccountForm.value.accountStatus === AccountStatusEnum.SUSPENDED) {
            const alertInput = this.alertController.create({
              header: 'Reason of Suspending Customer Account',
              inputs: [
                {
                  name: 'reason',
                  placeholder: 'Reason for suspension',
                },
              ],
              buttons: [
                {
                  text: 'OK',
                  handler: async (data) => {
                    this.customerAccountManagementService.suspendCustomerAccount(this.customer._id, data)
                      .subscribe(async (res: User) => {
                        console.log(res)
                        this.customer = res;
                        const toast = await this.toastController.create({
                          message: 'Customer details has been updated.',
                          duration: 2000
                        });
                        toast.present();
                      });
                    this.readOnly = true;
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
          } else {
            this.customer = cust;
            const toast = await this.toastController.create({
              message: 'Customer details has been updated.',
              duration: 2000
            });
            toast.present();
            this.readOnly = true;
          }

        }
      )
    } else {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Error',
        message: 'Please ensure that form inputs are correct.',
        buttons: [
          {
            text: 'Ok',
            handler: () => {
              return;
            }
          }
        ]
      });
      await alert.present();

    }
  }

  moveToCustomerManagement() {
    this.router.navigate(['customerAccountManagement']);
  }

  async viewAddresses() {
    const modal = await this.modalController.create({
      component: ViewAddressPage,
      cssClass: 'my-custom-class',
      componentProps: {
        'addresses': this.customer.addresses,
        'readOnly': this.readOnly,
      }
    });
    modal.onDidDismiss().then(async data => {
      for (var i = 0; i < this.currentAddress.length; i++) {
        if (this.currentAddress[i].addressDetails != this.customer.addresses[i].addressDetails) {
          this.changesMade = true;
          break;
        }
        if (this.currentAddress[i].postalCode != this.customer.addresses[i].postalCode) {
          this.changesMade = true;
          break;
        }
        if (this.changesMade === true && (i + 1) === this.currentAddress.length) {
          this.changesMade = false;
        }
      }

      if (this.changesMade) {
        const toast = await this.toastController.create({
          message: 'Address has been amended. Please update the changes to save the address.',
          duration: 3000
        });
        toast.present();
      }

      this.customer.addresses = data.data;
    })
    return await modal.present();
  }
}
