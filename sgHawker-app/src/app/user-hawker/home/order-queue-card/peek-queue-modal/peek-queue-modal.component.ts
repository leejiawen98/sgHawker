import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { QueuePreferenceEnum } from 'src/app/models/enums/queue-preference-enum';
import { Order } from 'src/app/models/order';
import { FoodBundleItem } from 'src/app/models/submodels/foodBundleItem';
import { SimilarGroup } from 'src/app/models/submodels/queueGeneration/similarGroup';
import { HawkerOrderDetailComponent } from 'src/app/shared/hawker-order-detail/hawker-order-detail.component';

@Component({
  selector: 'app-peek-queue-modal',
  templateUrl: './peek-queue-modal.component.html',
  styleUrls: ['./peek-queue-modal.component.scss'],
})
export class PeekQueueModalComponent implements OnInit {

  @Input() orders: Order [] | SimilarGroup [];
  @Input() userType: AccountTypeEnum;
  @Input() queuePreference: QueuePreferenceEnum;

  constructor(
    private modalController: ModalController
    ) { }

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }

  async openOrderModal(orderItem){
    const modal = await this.modalController.create({
      component: HawkerOrderDetailComponent,
      componentProps: {
        order: orderItem,
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    return await modal.present();
  }

  displayFoodBundleItems(bundleItems, divId) {
    const items = new Map();
    const cust = new Map();
    for (const fi of bundleItems) {
      if(!items.has(fi)) {
        items.set(fi, new FoodBundleItem(fi.foodItem, 1));
        if (fi.selectedCustomizations !== undefined) {
          cust.set(fi, fi.selectedCustomizations);
        }
      } else {
        const current = items.get(fi);
        current.qty += 1;
        items.set(fi, current);
      }
    }
    let result = '';
    for (const [key, value] of items) {
      const fb = value;
      result += '&nbsp;&nbsp;' + fb.foodItem.itemName;
      result += ' x' + fb.qty + '<br/>';

      if (cust.has(key)) {
        for (const option of cust.get(key)) {
          result += '&nbsp;&nbsp;&nbsp;' + option.selectedOption.optionName + '<br/>';
        }
      }
      document.getElementById(divId).innerHTML = result;
    }
  }

}
