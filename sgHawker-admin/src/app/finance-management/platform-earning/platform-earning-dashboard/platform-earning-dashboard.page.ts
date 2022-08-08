import { SessionService } from 'src/app/services/session.service';
import { WalletService } from './../../../services/wallet.service';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { Wallet } from 'src/app/models/wallet';
import { WalletTransaction } from 'src/app/models/walletTransaction';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order';
import { OrderDetailModalComponent } from 'src/app/shared/order-detail-modal/order-detail-modal.component';
import { ModalController, AlertController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
    selector: 'app-platform-earning-dashboard',
    templateUrl: './platform-earning-dashboard.page.html',
    styleUrls: ['./platform-earning-dashboard.page.scss'],
})
export class PlatformEarningDashboardPage implements OnInit {

    earningPieChart: any;
    earning: any;
    deliveryCommission: any;
    subscription: any;
    refund: any;
    earningByMonth: any;
    subscriberByMonth: any;

    // transaction history
    adminWallet: Wallet;
    transactions: WalletTransaction[];
    allTransactions: WalletTransaction[];
    dtOptions: any = {};

    //filter
    startDate: Date;
    endDate: Date;
    startOfPrevMonth: any;
    endOfPrevMonth: any;

    constructor(
        private walletService: WalletService,
        private sessionService: SessionService,
        private orderService: OrderService,
        private modalController: ModalController,
        private alertController: AlertController,
    ) { }

    ngOnInit() {
        this.dtOptions = {
            pagingType: 'full_numbers',
            dom: 'Bfrtip',
            responsive: true,
            buttons: [
            ],
            aoColumnDefs: [{ bSortable: false, aTargets: [7] }]
        };
        this.transactions = [];
        this.allTransactions = [];
        this.startOfPrevMonth = moment().subtract(1, 'months').startOf('month');
        this.endOfPrevMonth = moment().subtract(1, 'months').endOf('month');
    }

    ionViewWillEnter() {
        this.walletService.findWalletByOwnerId(this.sessionService.getCurrentUser()._id).subscribe(wallet => {
            this.adminWallet = wallet;
            this.allTransactions = _.cloneDeep(wallet.walletTransactions);
            // filter transactions
            this.filterTransactions(this.startOfPrevMonth, this.endOfPrevMonth);

            this.walletService
                .generatePlatformEarningDashboard(this.adminWallet._id)
                .subscribe(data => {
                    this.loadData(data);
                });
        });
    }

    filterByDuration() {
        this.walletService
            .generatePlatformEarningDashboard(this.adminWallet._id, this.startDate, this.endDate)
            .subscribe(data => {
                this.loadData(data);
            });
        this.filterTransactions(moment(this.startDate), moment(this.endDate));
    }

    resetDurationFilter() {
        this.startDate = undefined;
        this.endDate = undefined;
        this.walletService
            .generatePlatformEarningDashboard(this.adminWallet._id)
            .subscribe(data => {
                console.log('Reset duration filter')
                this.loadData(data);
            });
        this.filterTransactions(this.startOfPrevMonth, this.endOfPrevMonth);
    }

    viewOrderDetails(order: Order) {
        this.orderService.findOrderByOrderId(order._id).subscribe(
            orderToShow => {
                this.modalController.create({
                    component: OrderDetailModalComponent,
                    componentProps: {
                        order: orderToShow
                    }
                }).then(x => x.present());
            },
            error => {
                this.alertController.create({
                    header: 'Unable to retrieve order',
                    message: 'Please try again later',
                    buttons: [
                        {
                            text: 'Dismiss',
                            role: 'cancel'
                        }
                    ]
                }).then(x => x.present());
            }
        )
    }

    private filterTransactions(start, end) {
        this.transactions = this.allTransactions.filter(x => moment(x.transactionDate).isBetween(start, end, "date", "[]"))
    }

    private loadData(data) {
        // piechart
        this.earningPieChart = [];
        let pieChartSubscription = _.cloneDeep(data.prevMonthSubscription);
        pieChartSubscription.name = pieChartSubscription.name.split(":")[0];
        let pieChartCommission = _.cloneDeep(data.prevMonthCommission);
        pieChartCommission.name = pieChartCommission.name.split(":")[0];
        this.earningPieChart.push(pieChartSubscription);
        this.earningPieChart.push(pieChartCommission);

        // cards
        this.earning = [data.prevMonthEarning];
        this.deliveryCommission = [data.prevMonthCommission];
        this.subscription = [data.prevMonthSubscription];
        this.refund = [data.prevMonthRefund];

        // earning summary by month
        this.earningByMonth = [];
        this.earningByMonth.push(data.earningByMonth.totalEarning);
        this.earningByMonth.push(data.earningByMonth.deliveryCommission);
        this.earningByMonth.push(data.earningByMonth.subscription);
        this.earningByMonth.push(data.earningByMonth.refundForOrder);

        // subscriber by month
        this.subscriberByMonth = [];
        this.subscriberByMonth.push(data.subscriberByMonth.subscriber);
    }
}