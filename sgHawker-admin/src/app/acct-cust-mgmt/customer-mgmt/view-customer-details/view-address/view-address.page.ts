import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Address } from 'src/app/models/submodels/address';
import * as _ from 'lodash';

@Component({
  selector: 'app-view-address',
  templateUrl: './view-address.page.html',
  styleUrls: ['./view-address.page.scss'],
})
export class ViewAddressPage implements OnInit {

  @Input() addresses: Address[];
  @Input() readOnly: boolean;
  currentAddress: Address[];
  changesMade: boolean;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    this.currentAddress = _.cloneDeep(this.addresses);
  }

  dismissModal() {
    console.log(this.currentAddress);
    this.addresses = this.currentAddress;
    this.modalController.dismiss(this.currentAddress);
  }

  saveAddress() {
    this.modalController.dismiss(this.addresses);
  }


}
