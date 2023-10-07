import { Component } from '@angular/core';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent {
  favorites: any;
  trashCan = faTrashCan;

  ngOnInit() {
    const eventsString = localStorage.getItem('events');
    if (eventsString) {
      const events = JSON.parse(eventsString);
      if (events.length != 0) {
        this.favorites = events;
      }
      else {
        this.favorites = null;
      }
    }
    else {
      this.favorites = null;
    }
  }

  removeFromFavorites(eventID: string) {

    const eventsString = localStorage.getItem('events');
    if (eventsString) {
      const events = JSON.parse(eventsString);
      const index = events.findIndex((event: any) => event.id == eventID);
      events.splice(index, 1);
      if (events.length == 0) {
        this.favorites = null;
      }
      else {
        this.favorites = events;
      }
      localStorage.setItem('events', JSON.stringify(events));
    }

    alert('Event Removed from Favorites!');
  }
}
