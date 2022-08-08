/* eslint-disable object-shorthand */
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Menu } from '../models/menu';
import { catchError } from 'rxjs/operators';
import * as _ from 'lodash';

const httpOptions = {
  headers: new HttpHeaders({ 'content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class MenuService {

  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  retrieveActiveMenuForOutlet(outletId: string): Observable<Menu> {
    return this.httpClient
      .get<Menu>(this.baseUrl + '/hawker/menu/findActiveMenuByOutletId/' + outletId)
      .pipe(catchError(this.handleError));
  }

  createNewMenu(menu: Menu): Observable<Menu> {
    return this.httpClient
      .post<Menu>(
        this.baseUrl + '/hawker/menu/createMenu',
        menu
      );
  }
  retrieveAllUniqueFoodCategories(outletId: string): Observable<string[]> {
    return this.httpClient.get<string[]>
      (this.baseUrl + '/hawker/menuManagement/retrieveAllUniqueFoodCategories/' + outletId)
      .pipe(catchError(this.handleError));
  }

  updateCategoryName(outletId: string, oldItemCategory: string, newItemCategory: string): Observable<{ modified: number }> {
    return this.httpClient.post<{ modified: number }>
      (this.baseUrl + '/hawker/menuManagement/updateCategoryName/' +
        outletId, { oldItemCategory, newItemCategory })
      .pipe(catchError(this.handleError));
  }

  getMenuByOutlet(outletId: string | undefined): Observable<Menu[]> {
    return this.httpClient
      .get<Menu[]>(
        this.baseUrl + '/hawker/menu/findMenusByOutletId/' + outletId
      )
      .pipe(catchError(this.handleError));
  }

  deleteMenu(menuId: string | undefined): Observable<Menu> {
    return this.httpClient
      .delete<Menu>(
        this.baseUrl + '/hawker/menu/deleteMenu/' + menuId
      )
      .pipe(catchError(this.handleError));
  }

  getMenuById(menuId: string | undefined): Observable<Menu> {
    return this.httpClient
      .get<Menu>(
        this.baseUrl + '/hawker/menu/findMenuById/' + menuId
      )
      .pipe(catchError(this.handleError));
  }

  getAllMenus(): Observable<Menu[]> {
    return this.httpClient
      .get<Menu[]>(
        this.baseUrl + '/hawker/menu/findAllMenus'
      )
      .pipe(catchError(this.handleError));
  }

  updateMenuDetails(menu: Menu | undefined, menuId: string | undefined): Observable<Menu> {
    return this.httpClient
      .put<Menu>(
        // eslint-disable-next-line no-underscore-dangle
        this.baseUrl + '/hawker/menu/updateMenu/' + menuId,
        menu
      )
      .pipe(catchError(this.handleError));
  }

  updateCategory(foodItemsIds: string[] | undefined, toItemCategory: string): Observable<any> {
    return this.httpClient.post<any>(this.baseUrl + '/hawker/menuManagement/updateCategory/', { foodItemsIds, toItemCategory })
      .pipe(catchError(this.handleError));
  }

  synchronizeMenu(menuId: string, menu: Menu, outletIdArr: string[]): Observable<any> {
    const menuOutletDetails = {
      menu: menu,
      outletIdArr: outletIdArr
    };
    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchroniseMenu/' + menuId,
      menuOutletDetails
    ).pipe(catchError(this.handleError));
  }

  synchronizeMenuDelete(menu: Menu, outletIdArr: string[]): Observable<any> {
    const menuDetails = {
      menuToSync: menu,
      outletIdArr: outletIdArr
    };
    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchronizeMenuDelete',
      menuDetails
    ).pipe(catchError(this.handleError));
  }

  synchronizeMultipleMenus(menuArr: Menu[], outletIdArr: string[]): Observable<any>{
    const menusOutletDetails = {
      menuArr: menuArr,
      outletIdArr: outletIdArr
    };
    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchronizeMultipleMenus',
      menusOutletDetails
    ).pipe(catchError(this.handleError));
  }

  synchronizeMenuCategories(menuArr: any[], menuCategoryArr: any[], outletIdArr: string[]): Observable<any> {
    const menuDetails = {
      menuArr: menuArr,
      menuCategoryArr: menuCategoryArr,
      outletIdArr: outletIdArr
    };

    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchronizeMenuCategories',
      menuDetails
    ).pipe(catchError(this.handleError));
  }

  synchronizeMenuCategoryUpdate(menuCategory: any, menuIdArr: string[], outletIdArr: string[]): Observable<any> {
    const menuDetails = {
      menuIdArr,
      menuCategory,
      outletIdArr
    };

    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchronizeMenuCategoryUpdate',
      menuDetails
    ).pipe(catchError(this.handleError));
  }

  synchronizeMenuCategoryDelete(menuCategoryName: string, menuIdArr: string[]): Observable<any> {
    const menuDetails = {
      menuIdArr,
    };

    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchroniseMenuCategoryDelete/' + menuCategoryName,
      menuDetails
    ).pipe(catchError(this.handleError));
  }

  synchronizeFoodItemsAcrossMenus(foodItemArr: any[], menuIdArr: string[], outletIdArr: string[]): Observable<any> {
    const menuDetails = {
      menuIdArr,
      foodItemArr,
      outletIdArr
    };

    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchronizeFoodItemsAcrossMenus',
      menuDetails
    ).pipe(catchError(this.handleError));
  }

  synchroniseFoodItemDeleteAcrossMenus(foodItemName: string, menuIdArr: string[], outletIdArr: string[]): Observable<any> {
    const menuDetails = {
      menuIdArr,
      outletIdArr
    };

    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchroniseFoodItemDeleteAcrossMenus/' + foodItemName,
      menuDetails
    ).pipe(catchError(this.handleError));
  }

  synchronizeFoodBundlesAcrossMenus(foodBundleArr: any[], menuIdArr: string[], outletIdArr: string[]): Observable<any> {
    const menuDetails = {
      menuIdArr,
      foodBundleArr,
      outletIdArr
    };

    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchronizeFoodBundlesAcrossMenus',
      menuDetails
    ).pipe(catchError(this.handleError));
  }

  synchronizeFoodBundleUpdate(foodBundle: any, menuIdArr: string[], outletIdArr: string[]): Observable<any> {
    const menuDetails = {
      menuIdArr,
      foodBundle,
      outletIdArr
    };

    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchronizeFoodBundleUpdate',
      menuDetails
    ).pipe(catchError(this.handleError));
  }

  synchronizeFoodBundleDelete(foodBundleName: string, menuIdArr: string[]): Observable<any> {
    const menuDetails = {
      menuIdArr,
    };

    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/menu/synchroniseFoodBundleDelete/' + foodBundleName,
      menuDetails
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }
}
