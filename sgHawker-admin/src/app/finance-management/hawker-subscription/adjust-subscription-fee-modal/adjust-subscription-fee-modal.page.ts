import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-adjust-subscription-fee-modal',
  templateUrl: './adjust-subscription-fee-modal.page.html',
  styleUrls: ['./adjust-subscription-fee-modal.page.scss'],
})
export class AdjustSubscriptionFeeModalPage implements OnInit {

  user: User;

  subscriptionFeeForm: FormGroup;
  formValid: boolean;
  formSubmitted: boolean;

  constructor(
    private modalController: ModalController,
    private sessionService: SessionService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private alertController: AlertController
  ) {
    this.subscriptionFeeForm = this.formBuilder.group({
      premium: [0, Validators.required],
      deluxe: [0, Validators.required],
    })
  }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.subscriptionFeeForm.patchValue({
      premium: this.user.subscriptionFees.premium,
      deluxe: this.user.subscriptionFees.deluxe,
    });
  }

  //Get Form Error
  get errorControl() {
    return this.subscriptionFeeForm.controls;
  }

  //Check for form validation
  checkFormValid() {
    this.formValid = true;
    const controls = this.subscriptionFeeForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  adjustSubscriptionFees() {
    const subscriptionFees = {
      premium: Number(this.subscriptionFeeForm.value.premium),
      deluxe: Number(this.subscriptionFeeForm.value.deluxe)
    };

    this.alertController.create({
      header: 'Confirm Update Of Subscription Fee',
      message: `
      <p>Are you sure to proceed with the update of subscription fee?</p>
      <p><b>PREMIUM:</b> $${subscriptionFees.premium.toFixed(2)}</p>
      <p><b>DELUXE:</b> $${subscriptionFees.deluxe.toFixed(2)}</p>
      `,
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.userService.updateSubscriptionFees(subscriptionFees).subscribe(
              updatedUser => {
                this.sessionService.setCurrentUser(updatedUser);
                this.showSubscriptionAlert('Success', 'Subscription fees are updated');
                this.dismissModal();
              },
              error => {
                this.showSubscriptionAlert('Oops', error);
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
