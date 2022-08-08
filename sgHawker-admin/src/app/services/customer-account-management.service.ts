import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class CustomerAccountManagementService {
  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  findAllCustomerAccounts(): Observable<User[]> {
    return this.httpClient
      .get<User[]>(
        this.baseUrl +
        '/admin/customerAccountManagement/findAllCustomerAccounts/'
      )
      .pipe(catchError(this.handleError));
  }

  activateCustomerAccount(customerId: string): Observable<User> {
    return this.httpClient
    .put<User>(
      this.baseUrl +
      '/admin/customerAccountManagement/activateCustomerAccount/' +
      customerId,
      {}
    )
    .pipe(catchError(this.handleError));
  }

  suspendCustomerAccount(customerId: string, reason: any): Observable<User> {
    return this.httpClient
    .put<User>(
      this.baseUrl +
      '/admin/customerAccountManagement/suspendCustomerAccount/' + customerId,
      reason
    )
    .pipe(catchError(this.handleError));
  }

  updateCustomerAccount(customer: User) {
    return this.httpClient
    .put<User>(
      this.baseUrl + '/admin/customerAccountManagement/updateCustomerAccount/' + customer._id,
      customer
    )
    .pipe(catchError(this.handleError));
  }

  downloadVaccinationCert(email: string) : Observable<any> {
    const options: any = {
      headers: new HttpHeaders({ 'Content-Type': 'application/octet-stream' }),
      responseType: 'arraybuffer'
    };
    return this.httpClient
    .get<any>(
      this.baseUrl + '/customer/downloadVaccinationCert/' + email, options)
    .pipe(catchError(this.handleError));
  }

  checkExistVaccinationCertNotVaccinated(): Observable<any> {
    return this.httpClient
    .get<any>(
      this.baseUrl + '/admin/customerAccountManagement/checkExistVaccinationCertNotVaccinated')
    .pipe(catchError(this.handleError));
  }

  updateCustomerVaccinationStatus(customerId: string, status: any): Observable<User> {
    return this.httpClient
    .put<User>(
      this.baseUrl + '/admin/customerAccountManagement/updateCustomerVaccinationStatus/' + customerId,
      {status: status}
    )
    .pipe(catchError(this.handleError));
  }

  rejectCustomerUploadedVacCert(customer: User): Observable<User> {
    return this.httpClient
    .put<User>(
      this.baseUrl + '/admin/customerAccountManagement/rejectCustomerVaccinationCert',
      {customer: customer}
    )
    .pipe(catchError(this.handleError));
  }


  private handleError(error: HttpErrorResponse) {
    return throwError(error.message);
  }
}
