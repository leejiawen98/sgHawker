import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { IonTabs } from '@ionic/angular/directives/navigation/ion-tabs';
import * as moment from 'moment';
import { ReportStatusEnum } from '../models/enums/report-status-enum';
import { Report } from '../models/report';
import { ReportService } from '../services/report.service';
import { ReportDetailModalComponent } from '../shared/report-detail-modal/report-detail-modal.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-report-management',
  templateUrl: './report-management.page.html',
  styleUrls: ['./report-management.page.scss'],
})
export class ReportManagementPage implements OnInit {
  reports: Report[];
  dtOptions: any = {};

  // filter
  originalReports: Report[];
  startDate: Date;
  endDate: Date;
  userType: string;
  reportStatus: string;
  reportType: string;
  showFilter: boolean;

  constructor(
    private reportService: ReportService,
    private modalController: ModalController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.reports = [];
    this.userType = 'ALL';
    this.reportStatus = 'ALL';
    this.reportType = 'ALL';

    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: [
        {
          text: 'Toggle Filter',
          action: () => {
            this.toggleFilter();
          }
        },
        'excel'
      ],
      aoColumnDefs: [{ bSortable: false, aTargets: [5] }]
    };
    this.reportService.findAllReports().subscribe(reports => {
      this.reports = reports;
      this.originalReports = _.cloneDeep(this.reports);
    });
  }

  isReportOverdue(report: Report): boolean {
    const currDate = moment();
    return report.reportStatus === ReportStatusEnum.NEW && currDate.diff(moment(report.reportDate), 'days') > 1;
  }

  showReportDetails(report: Report) {
    this.modalController.create({
      component: ReportDetailModalComponent,
      componentProps: {
        report: report
      }
    }).then(x => x.present());
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  resetAllFilters() {
    this.reports = _.cloneDeep(this.originalReports);
    this.startDate = null;
    this.endDate = null;
    this.userType = 'ALL';
    this.reportStatus = 'ALL';
    this.reportType = 'ALL';
  }

  userTypeChanged(event) {
    this.userType = event.target.value;
  }

  reportStatusChanged(event) {
    this.reportStatus = event.target.value;
  }

  reportTypeChanged(event) {
    this.reportType = event.target.value;
  }

  private displayInvalidDateRangeAlert(message: string) {
    this.alertController.create({
      header: 'Invalid time range',
      message: message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    }).then(x => x.present());
  }
  
  filterRecords() {
    if ((this.startDate && !this.endDate) || (this.endDate && !this.startDate)) {
      this.displayInvalidDateRangeAlert('Provide both start date and end date');
      return;
    }

    if (this.startDate && this.endDate && moment(this.startDate).isAfter(moment(this.endDate))) {
      this.displayInvalidDateRangeAlert('Start date must be before end date');
      return;
    }

    let startDate;
    let endDate;

    if (this.startDate && this.endDate) {
      startDate = moment(this.startDate);
      endDate = moment(this.endDate);
    }

    this.reports = this.originalReports.filter(report => {

      let reportIsValid = true;

      // filter date range
      if (this.startDate && this.endDate) {
        reportIsValid = moment(report.reportDate).isBetween(startDate, endDate, 'days', '[]');
      }

      if (!reportIsValid) {
        return false;
      }

      // filter user type
      reportIsValid = this.userType === 'ALL' ? true : this.userType === 'OUTLET' ? report.outlet !== undefined : report.user !== undefined;

      if (!reportIsValid) {
        return false;
      }

      // filter report type
      reportIsValid = this.reportType === 'ALL' ? true : report.reportType.toString() === this.reportType;

      if (!reportIsValid) {
        return false;
      }

      // filter report status
      return this.reportStatus === 'ALL' ? true : report.reportStatus.toString() === this.reportStatus;
    })
  }

}
