import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from './../places.service';
import { Place } from './../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  $places: Observable<Place[]>;
  isLoading: boolean = false;
  placesSub: Subscription;
  error = false;

  constructor(
    private placesService: PlacesService,
    private router: Router) { }

  ngOnInit() {
    this.$places = this.placesService.places;
  }

  ionViewWillEnter() {
    this.isLoading = true;

    this.placesSub = this.placesService.fetchPlaces()
    .subscribe(
      () => {
        this.isLoading = false;
      },
      error => {
        console.log(error);
        this.error = true;
        this.isLoading = false;
      });
  }

  onEdit(placeId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/places/tabs/offers/edit/', placeId]);
  }

  ngOnDestroy() {
    this.placesSub.unsubscribe();
  }
}

