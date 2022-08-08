import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-food-item-details',
  templateUrl: './food-item-details.page.html',
  styleUrls: ['./food-item-details.page.scss'],
})
export class FoodItemDetailsPage implements OnInit {

  @Input() foodItem: any;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }

  dismissModal() {
    this.modalController.dismiss();
  }


}
