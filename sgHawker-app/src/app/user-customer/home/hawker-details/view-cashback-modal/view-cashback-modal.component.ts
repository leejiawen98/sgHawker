import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';

@Component({
  selector: 'app-view-cashback-modal',
  templateUrl: './view-cashback-modal.component.html',
  styleUrls: ['./view-cashback-modal.component.scss'],
})
export class ViewCashbackModalComponent implements OnInit {

  @Input() outlet: Outlet;

  simulatedCashback: number;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    const cashback = this.outlet.cashbackRate;
    this.simulatedCashback = 6.5*(cashback);
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
