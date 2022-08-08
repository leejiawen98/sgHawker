import { OrderStatusEnum } from './enums/order-status-enum.enum';
import { OrderTypeEnum } from './enums/order-type-enum.enum';
import { PaymentTypeEnum } from './enums/payment-type-enum.enum';
import { Outlet } from './outlet';
import { Address } from './submodels/address';
import { BundleOrderItem } from './submodels/bundleOrderItem';
import { OrderItem } from './submodels/orderItem';
import { User } from './user';

export class Order {
  _id: string | undefined;
  orderCreationTime: Date | undefined;
  orderPickUpTime: Date | undefined;
  completedTime: Date | undefined;
  estimatedTimeTillCompletion: number | undefined;
  totalPrice: number | undefined;
  debitedCashback: number | undefined;
  creditedCashback: number | undefined;
  deliveryFee: number | undefined;
  deliveryCommission: number | undefined;
  orderType: OrderTypeEnum | undefined;
  paymentType: PaymentTypeEnum | undefined;
  orderStatus: OrderStatusEnum | undefined;
  specialNote: string | undefined;
  deliverer: User | undefined;
  customer: User | undefined;
  outlet: Outlet | undefined;
  individualOrderItems: OrderItem[] | undefined;
  foodBundleOrderItems: BundleOrderItem[] | undefined;
  deliveryAddress: Address | undefined;

  // helper attributes for ranking similarity
  similarityScore: number | undefined;

  constructor(
    _id?: string,
    orderCreationTime?: Date,
    orderPickUpTime?: Date,
    completedTime?: Date,
    estimatedTimeTillCompletion?: number,
    totalPrice?: number,
    debitedCashback?: number,
    creditedCashback?: number,
    deliveryFee?: number,
    deliveryCommission?: number,
    orderType?: OrderTypeEnum,
    paymentType?: PaymentTypeEnum,
    orderStatus?: OrderStatusEnum,
    specialNote?: string,
    deliverer?: User,
    customer?: User,
    outlet?: Outlet,
    individualOrderItems?: OrderItem[],
    foodBundleOrderItems?: BundleOrderItem[],
    deliveryAddress?: Address
  ) {
    this._id = _id;
    this.orderCreationTime = orderCreationTime;
    this.orderPickUpTime = orderPickUpTime;
    this.completedTime = completedTime;
    this.estimatedTimeTillCompletion = estimatedTimeTillCompletion;
    this.customer = customer;
    this.outlet = outlet;
    this.totalPrice = totalPrice;
    this.orderType = orderType;
    this.paymentType = paymentType;
    this.orderStatus = orderStatus;
    this.specialNote = specialNote;
    this.individualOrderItems = individualOrderItems;
    this.foodBundleOrderItems = foodBundleOrderItems;
    this.debitedCashback = debitedCashback;
    this.creditedCashback = creditedCashback;
    this.deliveryFee = deliveryFee;
    this.deliveryCommission = deliveryCommission;
    this.deliverer = deliverer;
    this.deliveryAddress = deliveryAddress;
  }
}
