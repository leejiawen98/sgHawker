import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Wallet } from '../models/wallet';
import { Card } from '../models/submodels/card';
import { BankAccount } from '../models/submodels/bankAccount';
import { Order } from '../models/order';

const httpOptions = {
  headers: new HttpHeaders({ 'content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  // CUSTOMER
  createWalletForCustomer(userId: string): Observable<Wallet> {
    return this.httpClient.get<Wallet>(
      this.baseUrl + '/customer/wallet/createNewWalletForCustomer/' + userId
    ).pipe(catchError(this.handleError));
  }

  findWalletByOwnerId(userId: string): Observable<Wallet> {
    return this.httpClient.get<Wallet>(
      this.baseUrl + '/wallet/findWalletByOwnerId/' + userId
    ).pipe(catchError(this.handleError));
  }

  topUpFromCreditCardToWallet(walletId: string, topUpAmount: number, creditCardInvolved: Card): Observable<Wallet> {
    const topUpDetails = {
      topUpAmount,
      creditCardInvolved
    };

    return this.httpClient.post<Wallet>(
      this.baseUrl + '/customer/wallet/topUpFromCreditCardToWallet/' + walletId,
      topUpDetails
    ).pipe(catchError(this.handleError));
  }

  // OUTLET
  createWalletForOutlet(outletId: string, withdrawalFrequency: number): Observable<Wallet> {
    return this.httpClient.post<Wallet>(
      this.baseUrl + '/hawker/wallet/createNewWalletForOutlet/' + outletId,
      withdrawalFrequency
    ).pipe(catchError(this.handleError));
  }

  debitFromWalletToBankAccount(walletId: string, bankAccountInvolved?: BankAccount, setNewNextWithdrawalDate?: boolean): Observable<Wallet> {
    const details = {
      bankAccountInvolved,
      setNewNextWithdrawalDate
    };

    return this.httpClient.post<Wallet>(
      this.baseUrl + '/hawker/wallet/debitFromWalletToBankAccount/' + walletId,
      details
    ).pipe(catchError(this.handleError));
  }

  // ADMIN
  debitSubscriptionFeeByWalletId(walletId: string, overduePaymentDate: Date, creditCard: Card) {
    const subscriptionDetails = {
      overduePaymentDate: overduePaymentDate,
      creditCard: creditCard
    }
    return this.httpClient.post<Wallet>(
      this.baseUrl + '/admin/wallet/debitSubscriptionFeeByWalletId/' + walletId,
      subscriptionDetails
    ).pipe(catchError(this.handleError));
  }

  refundForOrder(fromWallet: Wallet, toWallet: Wallet, amountToRefund: number, order: Order): Observable<any> {
    const body = {
      fromWallet: fromWallet,
      toWallet: toWallet,
      amountToRefund: amountToRefund,
      order: order
    };

    return this.httpClient.post<Wallet>(
      this.baseUrl + '/admin/wallet/refundForOrder',
      body
    ).pipe(catchError(this.handleError));
  }

  generatePlatformEarningDashboard(walletId: string, startDate: Date = undefined, endDate: Date = undefined): Observable<any> {
    let body;
    if (startDate && endDate) {
      body = {
        startDate: startDate,
        endDate: endDate
      }
    };
    return this.httpClient.post<Wallet>(
      this.baseUrl + '/admin/wallet/generatePlatformEarningDashboard/' + walletId,
      body
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }
}
