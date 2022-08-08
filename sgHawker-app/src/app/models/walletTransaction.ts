import { BankAccount } from './submodels/bankAccount';
import { Card } from './submodels/card';
import { TransactionTypeEnum } from './enums/transaction-type-enum';
import { Order } from './order';
import { Wallet } from './wallet';

export class WalletTransaction {
    _id: string | undefined;
    transactionDate: Date | undefined;
    paidCashbackAmount: number | undefined;
    paidNonCashbackAmount: number | undefined;
    receivedCashbackAmount: number | undefined;
    refundedAmount: number | undefined;
    deliveryFee: number | undefined;
    deliveryEarning: number | undefined;
    deliveryCommission: number | undefined;
    topUpAmount: number | undefined;
    withdrawalAmount: number | undefined;
    paymentAmount: number | undefined;
    transactionType: TransactionTypeEnum | undefined;
    creditCardInvolved: Card | undefined;
    bankAccountInvolved: BankAccount | undefined;
    wallet: Wallet | undefined;
    order: Order | undefined;
    stripeTransactionId: string | undefined;

    constructor(
    _id?: string,
    transactionType?: TransactionTypeEnum,
    withdrawalAmount?: number,
    topUpAmount?: number,
    receivedCashbackAmount?: number,
    paidNonCashbackAmount?: number,
    paidCashbackAmount?: number,
    refundedAmount?: number,
    deliveryFee?: number,
    deliveryEarning?: number,
    deliveryCommission?: number,
    paymentAmount?: number,
    transactionDate?: Date,
    order?: Order,
    creditCardInvolved?: Card,
    bankAccountInvolved?: BankAccount,
    wallet?: Wallet,
    stripeTransactionId?: string,
      ) {
      this.order = order;
      this.transactionType = transactionType;
      this.withdrawalAmount = withdrawalAmount;
      this.topUpAmount = topUpAmount;
      this.receivedCashbackAmount = receivedCashbackAmount;
      this.paidCashbackAmount = paidCashbackAmount;
      this.paidNonCashbackAmount = paidNonCashbackAmount;
      this.refundedAmount = refundedAmount;
      this.deliveryFee - deliveryFee;
      this.deliveryEarning = deliveryEarning;
      this.deliveryCommission = deliveryCommission;
      this.paymentAmount = paymentAmount;
      this.transactionDate = transactionDate;
      this.creditCardInvolved = creditCardInvolved;
      this.bankAccountInvolved = bankAccountInvolved;
      this.wallet = wallet;
      this.stripeTransactionId = stripeTransactionId;
    }
}
