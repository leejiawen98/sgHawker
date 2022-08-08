import { SessionService } from './../../services/session.service';
import { RefundDetailsModalComponent } from './../refund-details-modal/refund-details-modal.component';
import { PopoverComponent } from './../popover/popover.component';
import { TransactionTypeEnum } from './../../models/enums/transaction-type-enum';
import { TransactionHistoryModalComponent } from './../transaction-history-modal/transaction-history-modal.component';
import { WalletService } from './../../services/wallet.service';
import { OrderDetailModalComponent } from './../order-detail-modal/order-detail-modal.component';
import { OrderService } from './../../services/order.service';
import { ReportService } from './../../services/report.service';
import { ModalController, AlertController, PopoverController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Report } from 'src/app/models/report';
import { ReportStatusEnum } from 'src/app/models/enums/report-status-enum';
import * as moment from 'moment';
import { Order } from 'src/app/models/order';
import { Wallet } from 'src/app/models/wallet';
import * as _ from 'lodash';
@Component({
  selector: 'app-report-detail-modal',
  templateUrl: './report-detail-modal.component.html',
  styleUrls: ['./report-detail-modal.component.scss'],
})
export class ReportDetailModalComponent implements OnInit {

  @Input() report: Report;
  order: Order;
  customerWallet: Wallet;
  outletWallet: Wallet;
  delivererWallet: Wallet;

  // edit response
  showResponse: boolean;
  sendEmail: string;
  emailAll: string;
  backUpReport: Report;
  baseUrl = "/api";

  constructor(
    private modalController: ModalController,
    private reportService: ReportService,
    private walletService: WalletService,
    private orderService: OrderService,
    private alertController: AlertController,
    private sessionService: SessionService
  ) {
  }

  ngOnInit() {
    this.init(this.report);
  }

  private init(report: Report) {
    this.report = report;
    this.backUpReport = _.cloneDeep(this.report);

    if (this.report.order) {
      this.orderService.findOrderByOrderId(this.report.order._id).subscribe(order => {
        this.order = order;

        this.walletService.findWalletByOwnerId(this.order.customer._id).subscribe(customerWallet => {
          this.customerWallet = customerWallet;
        });

        this.walletService.findWalletByOwnerId(this.order.outlet._id).subscribe(outletWallet => {
          this.outletWallet = outletWallet;
        });

        if (this.order.deliverer) {
          this.walletService.findWalletByOwnerId(this.order.deliverer.toString()).subscribe(delivererWallet => {
            this.delivererWallet = delivererWallet;
          })
        }
      });
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  viewOrderDetails() {
    this.modalController.create({
      component: OrderDetailModalComponent,
      componentProps: {
        order: this.order
      }
    }).then(x => x.present());
  }

  viewTransactionDetails(wallet: Wallet) {
    this.modalController.create({
      component: TransactionHistoryModalComponent,
      cssClass: 'transaction-history-modal',
      componentProps: {
        transactionType: TransactionTypeEnum.ORDER,
        outlet: wallet.outlet,
        customer: wallet.user
      }
    }).then(x => x.present());
  }

  viewRefundDetails() {
    const wallets = [];
    wallets.push(this.customerWallet);
    wallets.push(this.outletWallet);
    wallets.push(this.sessionService.getCurrentUser().wallet);
    if (this.order.deliverer) {
      wallets.push(this.delivererWallet); 
    }

    this.modalController.create({
      component: RefundDetailsModalComponent,
      componentProps: {
        order: this.order,
        wallets: wallets
      },
      backdropDismiss: false
    }).then(x => x.present());
  }

  isReportOverdue() {
    return this.report.reportStatus === ReportStatusEnum.NEW && moment().diff(moment(this.report.reportDate), 'days') > 1;
  }

  toggleShowResponse() {
    if (this.showResponse) {
      this.alertController.create({
        header: 'Are you sure?',
        message: 'Your current changes will be discarded.',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              this.showResponse = !this.showResponse;
              this.report = _.cloneDeep(this.backUpReport);
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      }).then(x => x.present());
      return;
    }

    this.showResponse = !this.showResponse;
    this.report = _.cloneDeep(this.backUpReport);
  }

  updateReportDetails() {
    let emails;

    if (this.sendEmail === 'YES') {
      emails = [];
      this.report.emailAttached = true;
      // push report by email
      if (this.report.user) {
        emails.push(this.report.user.email);
      }
      if (this.report.outlet) {
        emails.push(this.report.outlet.hawkerAccount.email);
      }

      if (this.emailAll === 'YES') {
        // email outlet of order
        emails.push(this.order.outlet.hawkerAccount.email);
        //TODO: email deliverer 
      }
    }

    this.reportService.updateReportDetailsById(this.report, emails).subscribe(updatedReport => {
      this.init(updatedReport);
      this.showResponse = false;
    });
  }

}