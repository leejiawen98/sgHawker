import { Report } from './../models/report';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  createNewFeedback(feedback: Report): Observable<Report> {
    return this.httpClient.post<Report>(
      `${this.baseUrl}/report/createNewFeedback`,
      feedback
    )
      .pipe(catchError(this.handleError));
  }

  createNewComplaint(complaint: Report): Observable<Report> {
    return this.httpClient.post<Report>(
      `${this.baseUrl}/report/createNewComplaint`,
      complaint
    )
      .pipe(catchError(this.handleError));
  }

  updateReportDetailsById(report: Report, emails?: string[]): Observable<Report> {
    let update = {
      report: report,
    };
    if (emails) {
      update["emails"] = emails;
    }
    return this.httpClient.post<Report>(
      `${this.baseUrl}/report/updateReportDetailsById/${report._id}`,
      update
    )
      .pipe(catchError(this.handleError));
  }

  deleteReportById(reportId: string): Observable<Report> {
    return this.httpClient.get<Report>(
      `${this.baseUrl}/report/deleteReportById/${reportId}`,
    )
      .pipe(catchError(this.handleError));
  }

  findAllPendingComplaints(): Observable<Report[]> {
    return this.httpClient.get<Report[]>(
      `${this.baseUrl}/admin/report/findAllPendingComplaints`,
    )
      .pipe(catchError(this.handleError));
  }

  findAllCompletedComplaints(): Observable<Report[]> {
    return this.httpClient.get<Report[]>(
      `${this.baseUrl}/admin/report/findAllCompletedComplaints`,
    )
      .pipe(catchError(this.handleError));
  }

  findAllFeedbacks(): Observable<Report[]> {
    return this.httpClient.get<Report[]>(
      `${this.baseUrl}/admin/report/findAllFeedbacks`,
    )
      .pipe(catchError(this.handleError));
  }

  findReportsByCustomerId(customerId: string): Observable<Report[]> {
    return this.httpClient.get<Report[]>(
      `${this.baseUrl}/customer/report/findReportsByCustomerId/${customerId}`,
    )
      .pipe(catchError(this.handleError));
  }

  findReportsByOutletId(outletId: string): Observable<Report[]> {
    return this.httpClient.get<Report[]>(
      `${this.baseUrl}/hawker/report/findReportsByOutletId/${outletId}`,
    )
      .pipe(catchError(this.handleError));
  }

  findAllReports(): Observable<Report[]> {
    return this.httpClient.get<Report[]>(
      `${this.baseUrl}/admin/report/findAllReports`,
    )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }
}
