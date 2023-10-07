import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpApiService {
  private backendUrl = 'https://assignment-8-webtech-1750.uw.r.appspot.com/api';

  constructor(private http: HttpClient) { }

  getAutocompleteOptions(keyword: string): Observable<any> {
    const url = `${this.backendUrl}/autocomplete?keyword=${keyword}`;
    return this.http.get(url);
  }

  getCoordinates(): Observable<any> {
    return this.http.get("https://ipinfo.io/json?token=dda65b576ea077");
  }

  getEvents(formData: any): Observable<any> {
    let url = `${this.backendUrl}/events?`;
    if (formData.autoLocate) {
      return this.getCoordinates().pipe(
        switchMap((response) => {
          let params = new HttpParams()
            .set('keyword', formData.keyword)
            .set('distance', formData.distance)
            .set('category', formData.category)
            .set('coordinates', response.loc)

          url += params.toString();
          console.log(url);
          return this.http.get(url);
        })
      );
    }
    else {
      let params = new HttpParams()
        .set('keyword', formData.keyword)
        .set('distance', formData.distance)
        .set('category', formData.category)
        .set('location', formData.location)
      url += params.toString();
      console.log(url);
      return this.http.get(url).pipe(
        catchError((error) => of('An error occurred while getting events.'))
      )
    }
  }

  getVenueDetails(keyword: string): Observable<any> {
    const url = `${this.backendUrl}/venues/${keyword}`;
    return this.http.get(url);
  }

  getEventDetails(eventId: string): Observable<any> {
    const url = `${this.backendUrl}/events/${eventId}`;
    return this.http.get(url);
  }

  searchArtists(keyword: string): Observable<any> {
    const url = `${this.backendUrl}/search-artists/${keyword}`;
    return this.http.get(url);
  }

  searchAlbumsForArtists(artistID: string): Observable<any> {
    const url = `${this.backendUrl}/albums/${artistID}`;
    return this.http.get(url);
  }

  getLatitudeLongitude(venue: string): Observable<any> {
    const gkey = 'AIzaSyD7_F9j5-rn7OP57XdiTXdLdGm1GeqhXl0';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${venue}&key=${gkey}`;
    return this.http.get(url);
  }


}
