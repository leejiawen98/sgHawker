/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';
import * as _ from 'lodash';
import { OutletService } from 'src/app/services/outlet.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-set-cashback-modal',
  templateUrl: './set-cashback-modal.component.html',
  styleUrls: ['./set-cashback-modal.component.scss'],
})
export class SetCashbackModalComponent implements OnInit {

  @Input() currentOutlet: Outlet;
  @Input() currentHawker: User;

  updatedOutlet: Outlet;

  simulatedCashback: number;
  simulatedEarnings: number;

  segmentModel = 'setCb';

  selectedOutlets: string[];
  filteredOutlets: Outlet[];
  primaryOutlet: Outlet;
  outlets: Outlet[];

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    public outletService: OutletService
  ) { }

  ngOnInit() {
    this.updatedOutlet = _.cloneDeep(this.currentOutlet);
    this.updatedOutlet.cashbackRate *= 100;
    this.updateSimulation();

    this.outletService.getHawkerOutlets(this.currentHawker._id)
    .subscribe(outlets => {
      this.outlets = _.cloneDeep(outlets);
      this.outlets.forEach(x=> x.cashbackRate = x.cashbackRate*100);
    });
   }

  ionViewWillEnter() {
  }

  updateSimulation() {
    const cashback = this.updatedOutlet.cashbackRate/100;
    this.simulatedCashback = 6.5*(cashback);
    this.simulatedEarnings = 6.50-this.simulatedCashback;
  }

  updateCashback() {
    // eslint-disable-next-line no-underscore-dangle
    const cashback = this.updatedOutlet.cashbackRate/100;
    this.outletService.updateOutletCashback(this.currentOutlet._id, cashback, this.updatedOutlet.cashbackIsActive)
    .subscribe(
      res => {
        this.currentOutlet = res;
        this.presentErrorToast('Cashback updated');
        this.modalController.dismiss({
          outlet: res
        });
      },
      err => {
        this.presentErrorToast('An error has occurred. Please try again.');
      }
    );
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async presentErrorToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  filterOutletOptions(ev: any) {
    this.selectedOutlets = [];
    this.filteredOutlets = _.cloneDeep(this.outlets);
    this.filteredOutlets = this.filteredOutlets.filter(x => x._id !== ev.detail.value);

    this.primaryOutlet = this.outlets.filter(x => x._id === ev.detail.value)[0];
  }

  syncCashback() {
    if (this.selectedOutlets.length===0) {
      this.presentErrorToast('Please selects the outlets first');
    } else {
      if (this.selectedOutlets.includes('all')) {
        this.selectedOutlets = this.outlets.map(x => x._id);
      }
      this.selectedOutlets.push(this.primaryOutlet._id);
      this.outletService.synchroniseCashbackAcrossOutlets(
        this.selectedOutlets,
        this.primaryOutlet.cashbackRate/100,
        this.primaryOutlet.cashbackIsActive)
      .subscribe(
        res => {
          this.presentErrorToast('Synchronisation successful');
          this.currentOutlet.cashbackRate = this.primaryOutlet.cashbackRate/100;
          this.currentOutlet.cashbackIsActive = this.primaryOutlet.cashbackIsActive;
          this.modalController.dismiss({
            outlet: this.currentOutlet
          });
        },
        error => {
          this.presentErrorToast('An error has occurred. Please try again later.');
        }
      );
    }
  }
}
