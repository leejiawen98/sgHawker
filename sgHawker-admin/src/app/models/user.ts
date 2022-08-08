import { Outlet } from 'src/app/models/outlet';
import { AccountStatusEnum } from './enums/account-status-enum.enum';
import { AccountTierEnum } from './enums/account-tier-enum.enum';
import { AccountTypeEnum } from './enums/account-type-enum.enum';
import { Address } from './submodels/address';
import { BankAccount } from './submodels/bankAccount';
import { Card } from './submodels/card';
import { SubscriptionFees } from './submodels/subscriptionFees';
import { Wallet } from './wallet';
export class User {
  _id: string | undefined;
  email: string | undefined;
  password: string | undefined;
  name: string | undefined;
  countryCode: string | undefined;
  phone: string | undefined;
  addresses: Address[] | undefined;
  cards: Card[] | undefined;
  bankAccounts: BankAccount[] | undefined;
  favouriteHawkerCentres: string[] | undefined;
  favouriteHawkerStores: string[] | undefined;
  profileImgSrc: string | undefined;
  accountTier: AccountTierEnum | undefined;
  accountUpgradeStatus: AccountStatusEnum | undefined;
  accountStatus: AccountStatusEnum | undefined;
  accountType: AccountTypeEnum | undefined;
  file: string | undefined;
  outlets: Outlet[];
  wallet: Wallet | undefined;
  isVaccinated: boolean | undefined;
  stripeCustomerId: string | undefined;
  currentBudgetGoal: number | undefined;
  futureBudgetGoal: number | undefined;
  subscriptionFees: SubscriptionFees | undefined;
  currentlyLoggedIn: boolean | undefined;
  lastLoggedIn: Date | undefined;

  constructor(
    _id?: string,
    email?: string,
    password?: string,
    name?: string,
    phone?: string,
    addresses?: Address[],
    cards?: Card[],
    bankAccounts?: BankAccount[],
    favouriteHawkerCentres?: string[],
    favouriteHawkerStores?: string[],
    profileImgSrc?: string,
    accountTier?: AccountTierEnum,
    accountType?: AccountTypeEnum,
    accountUpgradeStatus?: AccountStatusEnum,
    accountStatus?: AccountStatusEnum,
    outlets?: Outlet[],
    file?: string,
    wallet?: Wallet,
    isVaccinated?: boolean,
    stripeCustomerId?: string,
    currentBudgetGoal?: number,
    futureBudgetGoal?: number,
    currentlyLoggedIn?: boolean,
    lastLoggedIn?: Date
  ) {
    this.email = email;
    this.password = password;
    this.name = name;
    this.phone = phone;
    this.addresses = addresses;
    this.cards = cards;
    this.bankAccounts = bankAccounts;
    this.favouriteHawkerCentres = favouriteHawkerCentres;
    this.favouriteHawkerStores = favouriteHawkerStores;
    this.profileImgSrc = profileImgSrc;
    this.accountTier = accountTier;
    this.accountStatus = accountStatus;
    this.accountType = accountType;
    this.accountUpgradeStatus = accountUpgradeStatus;
    this.accountStatus = accountStatus;
    this.file = file;
    this.outlets = outlets;
    this.wallet = wallet;
    this.isVaccinated = isVaccinated;
    this.stripeCustomerId = stripeCustomerId;
    this.currentBudgetGoal = currentBudgetGoal;
    this.futureBudgetGoal = futureBudgetGoal;
    this.currentlyLoggedIn = currentlyLoggedIn;
    this.lastLoggedIn = lastLoggedIn;
  }
}
