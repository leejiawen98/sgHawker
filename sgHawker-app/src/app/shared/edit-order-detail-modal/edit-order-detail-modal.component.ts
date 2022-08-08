import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import * as moment from 'moment';
import { OrderTypeEnum } from 'src/app/models/enums/order-type-enum.enum';
import { Order } from 'src/app/models/order';
import { Address } from 'src/app/models/submodels/address';
import { User } from 'src/app/models/user';
import { OrderService } from 'src/app/services/order.service';
import { OutletService } from 'src/app/services/outlet.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-edit-order-detail-modal',
  templateUrl: './edit-order-detail-modal.component.html',
  styleUrls: ['./edit-order-detail-modal.component.scss'],
})
export class EditOrderDetailModalComponent implements OnInit {

  @Input() order: Order;
  user: User;
  allUserAddresses: Address[];

  diningOptions: OrderTypeEnum;
  advancedOrder = false;
  selectedTime: Date;
  selectedAddress: Address;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private sessionService: SessionService,
    private outletService: OutletService,
    private orderService: OrderService,
  ) {
  }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.diningOptions = this.order.orderType;

    if (this.diningOptions === OrderTypeEnum.DELIVERY) {
      this.advancedOrder = true;
    }

    if (this.order.orderPickUpTime) {
      this.selectedTime = this.order.orderPickUpTime;
    }

    this.allUserAddresses = this.user?.addresses;
    for (const varAddress in this.allUserAddresses) {
      if (this.allUserAddresses[varAddress].isDefault === true) {
        this.selectedAddress = this.allUserAddresses[varAddress];
      }
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  saveOrderType() {
    if (moment(this.order.orderCreationTime).isBefore(moment().subtract(30, 'seconds'))) {
      this.alertController.create({
        header: 'Unable to edit order',
        message: 'The stipulated 30 seconds have passed',
        buttons: [
          {
            text: 'Confirm',
            handler: () => {
              this.modalController.dismiss(undefined);
            }
          }
        ]
      }).then(x => x.present());
      return;
    }

    this.order.orderType = this.diningOptions;
    if (this.diningOptions === 'DELIVERY') {
      this.order.orderPickUpTime = this.selectedTime;
      this.order.deliveryAddress = this.selectedAddress;
    }

    if (this.diningOptions === 'TAKE_AWAY' && this.advancedOrder) {
      this.order.orderPickUpTime = this.selectedTime;
    }

    if (this.diningOptions === 'TAKE_AWAY' && this.advancedOrder === false) {
      this.order.orderPickUpTime = undefined;
    }

    this.orderService.updateOrderDetails(this.order).subscribe(updatedOrder => {
      this.modalController.dismiss(updatedOrder);
    });
  }

  validateOrder(outlet): boolean {
    if (this.diningOptions === undefined) {
      this.showAlert('Please select a dining option.');
      return false;
    }
    if ((this.diningOptions === OrderTypeEnum.TAKE_AWAY || this.diningOptions === OrderTypeEnum.DELIVERY) &&
      this.advancedOrder) {
      const currentTime = moment(moment(new Date()).format('H:mm'), 'H:mm');
      const selectedTime = moment(moment(new Date(this.selectedTime), 'HH:mm'), 'H:mm');
      if (selectedTime.isBefore(currentTime)) {
        this.showAlert('Please select a future time.');
        return false;
      } else if (!this.outletService.checkOutletIsActive(outlet, selectedTime)) {
        this.showAlert('Pick up time is after outlet closing time.');
        return false;
      }
    }
    if (this.diningOptions === OrderTypeEnum.DELIVERY && !this.selectedAddress) {
      this.showAlert('Please select a delivery address.');
      return false;
    }
    return true;
  }

  async showAlert(alertMessage: string) {
    const alert = await this.alertController.create({
      header: alertMessage,
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
