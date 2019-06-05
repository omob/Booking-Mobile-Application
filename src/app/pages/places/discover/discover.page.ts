import { Component, OnInit } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Observable, Subscription } from 'rxjs';
import { Place } from './../place.model';
import { PlacesService } from './../places.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {

  places: Place [];
  $places: Observable<Place[]>;
  isLoading: boolean = false;
  placesSub: Subscription;

  constructor(private placesService: PlacesService) { }

  ngOnInit() {
    this.$places = this.placesService.places;
  }

  ionViewWillEnter() {
    this.isLoading = true;

    this.placesSub = this.placesService.fetchPlaces()
    .subscribe(() => this.isLoading = false );
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log(event.detail);
  }
}
;