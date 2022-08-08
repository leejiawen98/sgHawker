/* eslint-disable max-len */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-synchronise-menu-info-modal',
  templateUrl: './synchronise-menu-info-modal.component.html',
  styleUrls: ['./synchronise-menu-info-modal.component.scss'],
})
export class SynchroniseMenuInfoModalComponent implements OnInit {

  @Input() type: 'Menu' | 'Menus' | 'FoodItems' | 'FoodItem' | 'FoodItem-delete'
    | 'FoodItemsInMenu' | 'FoodBundle' | 'FoodBundle-delete' | 'FoodBundles'
    | 'MenuCategories' | 'MenuCategory' | 'MenuCategory-delete';

  title: string;
  subtitle: string;
  description: string;
  subdescription: string;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    if (this.type === 'Menus' || this.type === 'Menu') {
      this.title = 'Synchronising Menu(s)';
      this.subtitle = 'This feature allows the merchants to choose multiple target outlets to synchronise the menu changes';
      this.description = 'When merchants add, modify or delete menu(s), the changes will be synchronised across the other outlets by pressing on the "Sync" button.';
      this.subdescription = 'After syncing, the menus will be replaced with the changes in menu of master outlet';

    } else if (this.type === 'FoodItems' || this.type === 'FoodItem' || this.type === 'FoodItem-delete' || this.type === 'FoodItemsInMenu') {
      this.title = 'Synchronising Food Item(s)';
      this.subtitle = 'This feature allows the merchants to choose multiple target outlets to synchronise the food item changes';
      this.description = 'When merchants add, modify or delete food item(s), they can choose if they want to synchronise the changes across the other outlets';
      this.subdescription = 'After syncing, the food items of the other outlets will be replaced with the menus of source outlets.';

    } else if (this.type === 'FoodBundle' || this.type === 'FoodBundles' || this.type === 'FoodBundle-delete') {
      this.title = 'Synchronising Food Bundle(s)';
      this.subtitle = 'This feature allows the merchants to choose multiple target outlets to synchronise the food bundle changes';
      this.description = 'When merchants add, modify or delete food item(s), they can either synchronise delete a food bundle, synchonise an existing food bundle in target outlets or synchronise all food bundles of master outlet';
      this.subdescription = 'After syncing all, the food bundles of the other outlets will be replaced with the food bundles of source outlets.';

    } else if (this.type === 'MenuCategories' || this.type === 'MenuCategory' || this.type === 'MenuCategory-delete') {
      this.title = 'Synchronising Menu Category(s)';
      this.subtitle = 'This feature allows the merchants to choose multiple target outlets to synchronise the menu category changes';
      this.description = 'When merchants add, modify or delete menu category(s), they can either synchronise delete a menu category, synchonise an existing menu category in target outlets or synchronise all menu categories of master outlet';
      this.subdescription = 'After syncing all, the menu categories of the other outlets will be replaced with the menu categories of source outlets.';

    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

}
