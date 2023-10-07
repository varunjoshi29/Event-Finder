import { Component, ViewChild } from '@angular/core';
import { DataSharingService } from '../data-sharing.service';
import { HttpApiService } from '../http-api.service';
import { faTwitter, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { forkJoin, Observable } from 'rxjs';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { ThemePalette } from '@angular/material/core';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-events-table',
  templateUrl: './events-table.component.html',
  styleUrls: ['./events-table.component.css']
})
export class EventsTableComponent {

  eventsData: any = undefined;
  eventDetails: any = undefined;
  artistsData: any = undefined;
  venueDetails: any = undefined;

  ticketStatusObject = {
    backgroundColor: '',
    text: ''
  };

  twitterIcon = faTwitter;
  facebookIcon = faFacebookSquare;
  heartIcon = faHeart;
  solidHeartIcon = faHeartSolid;
  spotifyIcon = faSpotify;
  backIcon = faAngleLeft;
  showMoreIcon = faAngleDown;
  showLessIcon = faAngleUp;

  isFavoriteEvent = false;
  openHoursExpanded = false;
  generalRuleExpanded = false;
  childRuleExpanded = false;
  isMapModalOpen = false;

  mapOptions: google.maps.MapOptions = {};
  marker: any = {};

  @ViewChild('myModal') myModal: any;

  warnColor: ThemePalette = 'warn';

  showArrows = true;




  constructor(private http: HttpApiService, private dataSharingService: DataSharingService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.dataSharingService.currentSearchData.subscribe(data => {
      this.eventsData = data;
      this.eventDetails = null;
      console.log(data);
    });
  }

  getSortedData(data: any) {
    return data.sort((a: any, b: any) => {
      return new Date(a.dates.start.localDate + 'T' + a.dates.start.localTime).getTime() -
        new Date(b.dates.start.localDate + 'T' + b.dates.start.localTime).getTime();
    });
  }

  onEventClicked(eventId: string) {
    this.http.getEventDetails(eventId).subscribe((response) => {
      this.eventDetails = response;
      this.setTicketStatus();
      const eventsString = localStorage.getItem('events');
      let events = null;
      if (eventsString) {
        events = JSON.parse(eventsString);
        if (events.includes(eventId)) {
          this.isFavoriteEvent = true;
        }
        else {
          this.isFavoriteEvent = false;
        }
      }
      this.setArtistsData();
      this.setVenueData();
    });
  }

  setVenueData() {
    const keyword = this.eventDetails._embedded.venues[0].name;
    this.http.getVenueDetails(keyword).subscribe((response: any) => {
      const venueResponse = response?._embedded?.venues[0];
      const name = venueResponse?.name;
      let address = venueResponse?.address?.line1;
      if (address && venueResponse?.city?.name) {
        address += ', ' + venueResponse?.city?.name;
      }
      else if (venueResponse?.city?.name) {
        address += venueResponse?.city?.name;
      }
      if (address && venueResponse?.state?.name) {
        address += ', ' + venueResponse?.state?.name;
      }
      else if (venueResponse?.state?.name) {
        address += venueResponse?.state?.name;
      }

      const phoneNumberDetail = venueResponse?.boxOfficeInfo?.phoneNumberDetail;
      const openHoursDetail = venueResponse?.boxOfficeInfo?.openHoursDetail;

      const generalRule = venueResponse?.generalInfo?.generalRule;
      const childRule = venueResponse?.generalInfo?.childRule;

      this.venueDetails = {
        'name': name,
        'address': address,
        'phoneNumberDetail': phoneNumberDetail,
        'openHoursDetail': openHoursDetail,
        'generalRule': generalRule,
        'childRule': childRule
      }

      this.http.getLatitudeLongitude(name).subscribe((response: any) => {
        const location = response?.results[0]?.geometry?.location;
        const lat = location?.lat ? location.lat : undefined;
        const lng = location?.lng ? location.lng : undefined;
        this.mapOptions = {
          center: { lat: lat, lng: lng },
          zoom: 14,
        };

        this.marker = {
          position: { lat: lat, lng: lng },
        };
      });
    });
  }

  setArtistsData() {
    const keywords: any[] = [];
    this.eventDetails._embedded.attractions.map((attraction: any) => {
      if (attraction?.classifications[0]?.segment?.name == "Music") {
        keywords.push(attraction.name);
      }
    });

    const artistRequests: Observable<any>[] = keywords.map((keyword) => {
      return this.http.searchArtists(keyword);
    });

    const artistsInfo: any[] = [];
    const albumsInfo: any[] = [];
    forkJoin(artistRequests)
      .subscribe({
        next: (responses) => {
          responses.map((response: any) => {
            artistsInfo.push({
              id: response.artists.items[0].id,
              popularity: response.artists.items[0]?.popularity,
              imageUrl: response.artists.items[0]?.images[0].url,
              followers: response.artists.items[0]?.followers.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
              spotifyUrl: response.artists.items[0]?.external_urls.spotify
            });
          });

          const albumRequests: Observable<any>[] = artistsInfo.map((artist) => {
            return this.http.searchAlbumsForArtists(artist.id);
          });

          forkJoin(albumRequests)
            .subscribe({
              next: (responses) => {
                responses.map((response: any) => {
                  const albumCoverForThisArtist: any[] = [];
                  response.items.map((item: any) => {
                    albumCoverForThisArtist.push(item.images[0].url);
                  });
                  albumsInfo.push(albumCoverForThisArtist);
                });

                artistsInfo.forEach((artist, index) => {
                  artist.name = keywords[index];
                  artist.albumsCovers = albumsInfo[index];
                });

                this.artistsData = artistsInfo.length > 0 ? artistsInfo : null; // setting our artistsData Info
              },
              error: (error) => {
                console.error(error);
              }
            });
        },
        error: (error) => {
          console.error(error);
        }
      });

    if (keywords.length == 0) {
      this.artistsData = null;
    }
    else if (keywords.length == 1) {
      this.showArrows = false;
    }
    else {
      this.showArrows = true;
    }
  }

  getAttractionsName() {
    return this.eventDetails._embedded.attractions.map((attraction: { name: any; }) => attraction.name).join(' | ')
  }

  getGenres() {
    const segment = this.eventDetails?.classifications[0]?.segment?.name;
    const genre = this.eventDetails?.classifications[0]?.genre?.name;
    const subGenre = this.eventDetails?.classifications[0]?.subGenre?.name;
    const type = this.eventDetails?.classifications[0]?.type?.name;
    const subType = this.eventDetails?.classifications[0]?.subType?.name;
    return [segment, genre, subGenre, type, subType].filter(value => value != null && value != "Undefined").join(' | ');
  }

  setTicketStatus() {
    try {
      const ticketStatusCode = this.eventDetails.dates.status.code;
      if (ticketStatusCode == "onsale") {
        this.ticketStatusObject.backgroundColor = "Green";
        this.ticketStatusObject.text = "On Sale";
      } else if (ticketStatusCode == "offsale") {
        this.ticketStatusObject.backgroundColor = "Red";
        this.ticketStatusObject.text = "Off Sale";
      } else if (ticketStatusCode == "cancelled" || ticketStatusCode == "canceled") {
        this.ticketStatusObject.backgroundColor = "Black";
        this.ticketStatusObject.text = "Canceled";
      } else if (ticketStatusCode == "postponed") {
        this.ticketStatusObject.backgroundColor = "Orange";
        this.ticketStatusObject.text = "Postponed";
      } else if (ticketStatusCode == "rescheduled") {
        this.ticketStatusObject.backgroundColor = "Orange";
        this.ticketStatusObject.text = "Rescheduled";
      }
    }
    catch (error) {
      console.log("No ticket status");
    }
  }

  addToFavorites() {
    const eventsString = localStorage.getItem('events');
    const events = eventsString ? JSON.parse(eventsString) : [];
    events.push({
      id: this.eventDetails.id,
      date: this.eventDetails.dates.start.localDate,
      event: this.eventDetails.name, category: this.getGenres(),
      venue: this.eventDetails._embedded.venues[0].name
    });
    localStorage.setItem('events', JSON.stringify(events));
    alert('Event Added to Favorites!');
    this.isFavoriteEvent = true;
  }

  removeFromFavorites() {
    const eventsString = localStorage.getItem('events');
    if (eventsString) {
      const events = JSON.parse(eventsString);
      const index = events.findIndex((event: any) => event.id == this.eventDetails.id);
      events.splice(index, 1);
      localStorage.setItem('events', JSON.stringify(events));
    }

    alert('Event Removed from Favorites!');
    this.isFavoriteEvent = false;
  }

  openModal() {
    const options: NgbModalOptions = {
      backdrop: false,
    };
    this.modalService.open(this.myModal, options);
  }

}



//TODO // Mat labels