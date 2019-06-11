import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { PlacesService } from './../../places.service';
import { Router } from '@angular/router';
import { Place } from './../../place.model';
import { LoadingController } from '@ionic/angular';
import { PlaceLocation } from 'src/app/pages/places/location.model';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {

  form: FormGroup;
  isLoading: false;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup(
      {
        title: new FormControl(null, Validators.required),
        description: new FormControl( null, [ Validators.required, Validators.maxLength(180)]),
        price: new FormControl( null, [ Validators.required, Validators.min(1) ]),
        dateFrom: new FormControl( null, Validators.required),
        dateTo: new FormControl( null, Validators.required),
        location: new FormControl( null, Validators.required)
      }
    );
  }

  onLocationPicked(location: PlaceLocation) {
    console.log("Location picked", location)
    this.form.patchValue({
      location
    });
  }
  onCreateOffer() {
    if (!this.form.valid) { return; }

    const place = {
      title: this.form.value.title,
      description: this.form.value.description,
      price: +this.form.value.price,
      dateFrom: new Date(this.form.value.dateFrom),
      dateTo: new Date(this.form.value.dateTo),
      location: this.form.value.location
    };

    this.loadingCtrl
    .create({ message: 'Creating new place...'})
    .then(loadingEl => {
      loadingEl.present();

      this.placesService
        .addPlace(
          place.title,
          place.description,
          place.price,
          place.dateFrom,
          place.dateTo,
          place.location)
            .subscribe(() => {
              loadingEl.dismiss();
              this.form.reset();
              this.router.navigate(['/places/tabs/offers']);
            });
    });
  }

  get description() {
    return this.form.get('description');
  }
}
