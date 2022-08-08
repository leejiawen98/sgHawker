import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountTierEnum } from '../models/enums/account-tier-enum.enum';
import { Outlet } from '../models/outlet';
import { User } from '../models/user';

const httpOptions = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class HawkerAccountManagementService {
  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  findAllPendingHawkerAccounts(): Observable<User[]> {
    return this.httpClient
      .get<User[]>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/findAllPendingHawkerAccounts'
      )
      .pipe(catchError(this.handleError));
  }

  findAllApprovedHawkerAccounts(): Observable<User[]> {
    return this.httpClient
      .get<User[]>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/findAllApprovedHawkerAccounts'
      )
      .pipe(catchError(this.handleError));
  }

  approveHawker(hawkerId: string | undefined): Observable<User> {
    return this.httpClient
      .put<User>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/approveHawker/' +
        hawkerId,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  rejectHawker(hawkerId: string | undefined, writtenInstruction: string | undefined): Observable<User> {
    const rejMsg = {
      writtenInstruction,
    };

    return this.httpClient
      .put<User>(this.baseUrl + '/admin/hawkerAccountManagement/rejectHawker/' + hawkerId,
        rejMsg
      )
      .pipe(catchError(this.handleError));
  }

  getHawkerAccount(hawkerId: string | undefined): Observable<User> {
    return this.httpClient
      .get<User>(
        this.baseUrl + '/admin/hawkerAccountManagement/findHawkerAccount/' + hawkerId
      )
      .pipe(catchError(this.handleError));
  }

  updateHawkerAccount(hawker: any | undefined): Observable<User> {
    return this.httpClient
      .put<User>(
        this.baseUrl + '/admin/hawkerAccountManagement/updateHawkerAccount/' + hawker._id,
        hawker
      )
      .pipe(catchError(this.handleError));
  }

  downloadHawkerDocumentsAsZip(hawkerEmail: string): Observable<any> {
    const options: any = {
      headers: new HttpHeaders({ 'Content-Type': 'application/octet-stream' }),
      responseType: 'arraybuffer'
    };
    return this.httpClient
      .get<any>(
        this.baseUrl + '/admin/hawkerAccountManagement/downloadHawkerDocumentsAsZip/' + hawkerEmail, options)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.message);
  }

  // hawker upgrade requests
  findAllPendingUpgradeHawkerAccounts(): Observable<User[]> {
    return this.httpClient
      .get<User[]>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/findAllPendingUpgradeHawkerAccounts'
      )
      .pipe(catchError(this.handleError));
  }

  findAllApprovedUpgradeHawkerAccounts(): Observable<User[]> {
    return this.httpClient
      .get<User[]>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/findAllApprovedUpgradeHawkerAccounts'
      )
      .pipe(catchError(this.handleError));
  }

  downloadAccountUpgradeDocumentsAsZip(hawkerEmail: string): Observable<any> {
    const options: any = {
      headers: new HttpHeaders({ 'Content-Type': 'application/octet-stream' }),
      responseType: 'arraybuffer'
    };
    return this.httpClient
      .get<any>(
        this.baseUrl + '/hawker/downloadAccountUpgradeDocumentsAsZip/' + hawkerEmail, options)
      .pipe(catchError(this.handleError));
  }

  approveAccountUpgrade(hawkerId: string | undefined, newAccountTier: AccountTierEnum, masterOutletId: string): Observable<User> {
    const details = {
      newAccountTier,
      masterOutletId
    };
    return this.httpClient
      .post<User>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/approveAccountTier/' + hawkerId, details
      )
      .pipe(catchError(this.handleError));
  }

  rejectAccountUpgrade(hawkerId: string | undefined, newAccountTier: AccountTierEnum, masterOutlet: Outlet, writtenInstruction: string): Observable<User> {
    const details = {
      writtenInstruction,
      newAccountTier,
      masterOutlet
    };
    return this.httpClient
      .post<User>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/rejectAccountTier/' + hawkerId, details
      )
      .pipe(catchError(this.handleError));
  }

}
