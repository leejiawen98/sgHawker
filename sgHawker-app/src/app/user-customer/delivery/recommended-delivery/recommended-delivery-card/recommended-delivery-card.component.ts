import { Component, Input, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-recommended-delivery-card',
  templateUrl: './recommended-delivery-card.component.html',
  styleUrls: ['./recommended-delivery-card.component.scss'],
})
export class RecommendedDeliveryCardComponent implements OnInit {

  @Input() recommendedOrder: Order;
  @Input() fromOutletPage: boolean;

  constructor() { }

  ngOnInit() {}

}
