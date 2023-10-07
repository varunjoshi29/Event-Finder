import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, filter } from 'rxjs/operators';
import { DataSharingService } from '../data-sharing.service';
import { HttpApiService } from '../http-api.service';


@Component({
  selector: 'app-search-component',
  templateUrl: './search-component.component.html',
  styleUrls: ['./search-component.component.css']
})
export class SearchComponentComponent {

  formData = {
    keyword: '',
    distance: 10,
    category: 'Default',
    location: '',
    autoLocate: false
  };

  autocompleteOptions: string[] = [];
  keywordControl = new FormControl();
  isLoading = false;


  constructor(private httpApiService: HttpApiService, private dataSharingService: DataSharingService) { }

  ngOnInit() {
    this.keywordControl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= 1
        }),
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(keyword => this.httpApiService.getAutocompleteOptions(keyword).pipe(finalize(() => {
          this.isLoading = false;
        })))
      )
      .subscribe(response => {
        this.autocompleteOptions = <Array<string>>response;
      });
  }

  onSelected() {
    this.formData.keyword = this.keywordControl.value;
  }

  checkLocationText() {
    if (this.formData.autoLocate) {
      this.formData.location = '';
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    this.httpApiService.getEvents(this.formData).subscribe((resultData => {
      this.dataSharingService.setSearchData(resultData);
    }));

  }

  clear(): void {
    this.formData = {
      keyword: '',
      distance: 10,
      category: 'Default',
      location: '',
      autoLocate: false
    }
    this.dataSharingService.setSearchData(null);
  }
}
