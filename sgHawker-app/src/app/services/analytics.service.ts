import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Outlet } from '../models/outlet';
import { Goal } from '../models/submodels/goal';

const httpOptions = {
  headers: new HttpHeaders({ 'content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})

export class AnalyticsService {

  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  generateHawkerAnalytics(outletId: string, startDate: Date, endDate: Date, interval: string): Observable<any> {
    const details = {
      startDate,
      endDate,
      interval
    };
    return this.httpClient
      .post<any>(
        this.baseUrl + '/hawker/analytics/generateHawkerAnalytics/' + outletId, details
      )
      .pipe(catchError(this.handleError));
  }

  generateHawkerAnalyticsForOutlet(outletId: string, startDate: Date, endDate: Date, interval: string): Observable<any> {
    const details = {
      startDate,
      endDate,
      interval
    };
    return this.httpClient
      .post<any>(
        this.baseUrl + '/hawker/analytics/generateHawkerAnalyticsForOutlet/' + outletId, details
      )
      .pipe(catchError(this.handleError));
  }

  //GOAL
  createGoal(outletId: string, goal: Goal): Observable<Outlet> {
    return this.httpClient
      .post<Outlet>(
        this.baseUrl + '/hawker/analytic/addGoal/' + outletId, goal
      )
      .pipe(catchError(this.handleError));
  }

  updateGoal(outletId: string, goal: Goal): Observable<Outlet> {
    return this.httpClient
      .put<Outlet>(
        this.baseUrl + '/hawker/analytic/updateGoal/' + outletId,
        goal
      )
      .pipe(catchError(this.handleError));
  }

  retrieveHawkerEarningsByOutletIdForSpecificPeriod(outletId: string, startDate: Date, endDate: Date): Observable<any> {
    const details = {
      startDate,
      endDate,
    };
    return this.httpClient
    .post<any>(
      this.baseUrl + '/hawker/analytic/retrieveHawkerEarningsByOutletIdForSpecificPeriod/' + outletId, details
    )
    .pipe(catchError(this.handleError));
  }

  findNumOfSalesByOutletIdForSpecificPeriod(outletId: string, startDate: Date, endDate: Date): Observable<any> {
    const details = {
      startDate,
      endDate,
    };
    return this.httpClient
    .post<any>(
      this.baseUrl + '/hawker/analytic/findNumOfSalesByOutletIdForSpecificPeriod/' + outletId, details
    )
    .pipe(catchError(this.handleError));
  }
  findSalesForOutlets(outlets: Outlet[]): Observable<any> {
    return this.httpClient
    .post<any>(
      this.baseUrl + '/hawker/analytic/findSalesForOutlets', outlets
    )
    .pipe(catchError(this.handleError));
  }
  generateHawkerAnalyticsFoodItems(outletId: string, startDate: Date, endDate: Date): Observable<any> {
    const details = {
      startDate,
      endDate
    };
    return this.httpClient
      .post<any>(
        this.baseUrl + '/hawker/analytics/generateHawkerAnalyticsFoodItems/' + outletId, details
      )
      .pipe(catchError(this.handleError));
  }

  retrieveComparativeSalesAnalytics(outletId: string, startDate: Date, endDate: Date): Observable<any> {
    const details = {
      startDate,
      endDate,
    };
    return this.httpClient
      .post<any>(
        this.baseUrl + '/hawker/analytics/retrieveComparativeSalesAnalytics/' + outletId, details
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }
}
