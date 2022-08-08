import { Component, Input, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-delivery-order-card',
  templateUrl: './delivery-order-card.component.html',
  styleUrls: ['./delivery-order-card.component.scss'],
})
export class DeliveryOrderCardComponent implements OnInit {

  @Input() pendingDeliveryOrder: Order;
  constructor() { }

  ngOnInit() {}

}
