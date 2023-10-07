import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {

  private searchData = new BehaviorSubject<any>(null);
  currentSearchData = this.searchData.asObservable();

  constructor() { }

  setSearchData(data: any) {
    this.searchData.next(data);
  }
}
