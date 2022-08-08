import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BankAccount } from 'src/app/models/submodels/bankAccount';
import { Card } from 'src/app/models/submodels/card';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-linked-payment-methods',
  templateUrl: './linked-payment-methods.page.html',
  styleUrls: ['./linked-payment-methods.page.scss'],
})
export class LinkedPaymentMethodsPage implements OnInit {

  user: User;
  myCards: Card[];
  myBankAccounts: BankAccount[];

  constructor(
    public sessionService: SessionService,
    private router: Router,
    private userService: UserService
  ) { }

  initData() {
    this.user = this.sessionService.getCurrentUser();
    this.myBankAccounts = this.user.bankAccounts;
    // eslint-disable-next-line no-underscore-dangle
    this.userService.findAllCardsByCustomerId(this.user._id).subscribe(cards => {
      this.myCards = cards;
    });
  }

  ngOnInit() {
    this.initData();
  }

  ionViewWillEnter() {
    this.initData();
  }

  addNewCard(){
    this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods/create-card']);
  }

  directToSpecificCard(cardId){
    this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods/card-details',cardId]);
  }

  addNewBankAccount(){
    this.router.navigate(['hawker/profile/digital-wallet/linked-payment-methods/create-bank-account']);
  }

  directToSpecificBankAccount(bankAccountId){
    this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods/bank-account-details',bankAccountId]);
  }
}
