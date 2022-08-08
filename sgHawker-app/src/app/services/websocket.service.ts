import { SocketNamespaceEnum } from './../models/enums/socket-namespace-enum.enum';
/* eslint-disable no-underscore-dangle */
import { Order } from './../models/order';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(
    private socket: Socket,
  ) {
  }

  // queue service
  onNewOrderListener() {
    return this.socket
      .fromEvent<Order>(SocketNamespaceEnum.NEW_ORDER);
  }

  // customer order
  onCancelOrderListener() {
    return this.socket
      .fromEvent<Order>(SocketNamespaceEnum.CANCEL_ORDER);
  }

  // customer order
  // hawker cash order
  onDeleteUnpaidCashOrderListener() {
    return this.socket
      .fromEvent<Order>(SocketNamespaceEnum.DELETE_UNPAID_CASH_ORDER);
  }

  // hawker cash order
  onNewUnpaidCashOrderListener() {
    return this.socket
      .fromEvent<Order>(SocketNamespaceEnum.NEW_UNPAID_CASH_ORDER);
  }

  // customer order
  onUpdateOrderStatusListener() {
    return this.socket
      .fromEvent<Order>(SocketNamespaceEnum.UPDATE_ORDER_STATUS);
  }

  // customer order
  onUnableToFulfillOrderListener() {
    return this.socket
      .fromEvent<Order>(SocketNamespaceEnum.UNABLE_TO_FULFILL_ORDER);
  }

  // automatically reconnect to same room upon successful connection
  onSuccessfulConnectionListener() {
    return this.socket.fromEvent<any>(SocketNamespaceEnum.SUCCESSFUL_CONNECTION);
  }

  onDelivererUpdateListener() {
    return this.socket.fromEvent<Order>(SocketNamespaceEnum.DELIVERY);
  }

}
