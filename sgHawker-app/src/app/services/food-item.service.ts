import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FoodItem } from '../models/foodItem';
import { Outlet } from '../models/outlet';

const httpOptions = {
  headers: new HttpHeaders({ 'content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class FoodItemService {
  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  createFoodItem(foodItem: FoodItem): Observable<FoodItem> {
    return this.httpClient
      .post<FoodItem>(
        this.baseUrl + '/hawker/foodItem/createFoodItem',
        foodItem
      ).pipe(catchError(this.handleError));
  }

  uploadFoodItemPicture(foodItemId: string, file: Blob): Observable<FormData> {
    const formData = new FormData();
    // Store form name as "file" with file data
    formData.append('file', file);
    return this.httpClient
      .post<FormData>(
        this.baseUrl + '/hawker/foodItem/uploadFoodItemImage/' + foodItemId, formData)
      .pipe(catchError(this.handleError));
  }

  findAllFoodItemByOutletId(outletId: string): Observable<any> {
    return this.httpClient
      .get<any>(
        this.baseUrl + '/hawker/foodItem/viewAllFoodItemByOutlet/' + outletId
      )
      .pipe(catchError(this.handleError));
  }

  updateFoodItemDetails(foodItem: FoodItem): Observable<any> {
    return this.httpClient
      .post<any>(
        this.baseUrl + '/hawker/foodItem/updateFoodItemDetails/', foodItem)
      .pipe(catchError(this.handleError));
  }

  findFoodItemById(foodId: string): Observable<any> {
    return this.httpClient
      .get<any>(
        this.baseUrl + '/hawker/foodItem/findFoodItemById/' + foodId
      )
      .pipe(catchError(this.handleError));
  }

  deleteFoodItem(foodItemId: string | undefined): Observable<FoodItem> {
    return this.httpClient
      .delete<FoodItem>(
        this.baseUrl + '/hawker/foodItem/deleteFoodItem/' + foodItemId
      )
      .pipe(catchError(this.handleError));
  }

  enableFoodItemById(foodItemId: string | undefined): Observable<FoodItem> {
    return this.httpClient
    .get<FoodItem>(
      this.baseUrl + '/hawker/foodItem/enableFoodItemById/' + foodItemId
    )
    .pipe(catchError(this.handleError));
  }

  disableFoodItemById(foodItemId: string | undefined): Observable<FoodItem> {
    return this.httpClient
    .get<FoodItem>(
      this.baseUrl + '/hawker/foodItem/disableFoodItemById/' + foodItemId
    )
    .pipe(catchError(this.handleError));
  }

  synchroniseAllFoodItemsAcrossOutlets(foodItemArray: any[], outletIdArray: string[], foodItemSyncType: string): Observable<any> {
    const details = {
      foodItemArray,
      outletIdArray
    };
    return this.httpClient
      .post<any>(
        this.baseUrl + '/hawker/foodItem/synchroniseAllFoodItemsAcrossOutlets/' + foodItemSyncType, details)
      .pipe(catchError(this.handleError));
  }

  synchroniseFoodItemUpdateAcrossOutlets(foodItem: any, outletIdArray: string[], foodItemNameBeforeUpdate: string): Observable<any> {
    const details = {
      foodItem,
      outletIdArray
    };
    return this.httpClient
      .post<any>(
        this.baseUrl + '/hawker/foodItem/synchroniseFoodItemUpdateAcrossOutlets/' + foodItemNameBeforeUpdate, details)
      .pipe(catchError(this.handleError));
  }

  synchroniseFoodItemDeleteAcrossOutlets(foodItemName: any, outletIdArray: string[]): Observable<any> {
    const details = {
      outletIdArray
    };
    return this.httpClient
      .post<any>(
        this.baseUrl + '/hawker/foodItem/synchroniseFoodItemDeleteAcrossOutlets/' + foodItemName, details)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }
}
