import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation } from 'src/app/pages/places/location.model';
import { environment } from './../../../../environments/environment';
import { MapModalComponent } from './../../map-modal/map-modal.component';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  @Output() locationPick = new EventEmitter<PlaceLocation>();

  googleMapsAPIKey;
  selectedLocationImage: string;
  isLoading = false;

  constructor( private modalCtrl: ModalController, private http: HttpClient) { 
    const { googleMapsAPIKey } = environment;
    this.googleMapsAPIKey = googleMapsAPIKey;
  }

  ngOnInit() {}

  onPickLocation() {
    this.modalCtrl.create({
      component: MapModalComponent
    })
    .then(modalEl => {
      modalEl.onDidDismiss().then( modalData => {
        const { data: latLng, role } = modalData;
        if (!latLng) {
          return;
        }
        const { lat, lng } = latLng;
        const pickedLocation: PlaceLocation = {
          lat,
          lng,
          address: null,
          staticMapImageUrl: null
        };

        this.isLoading = true;

        this.getAddress(latLng)
          .pipe(
            switchMap(address => {
              pickedLocation.address = address;
              return of(this.getMapImage(lat, lng, 16));
            })
          )
        .subscribe(staticMapImageUrl => {
          pickedLocation.staticMapImageUrl = staticMapImageUrl;
          this.selectedLocationImage = staticMapImageUrl;

          this.isLoading = false;
          this.locationPick.emit(pickedLocation);
        });
      });

      modalEl.present();
    });
  }


  private getAddress({lat, lng}) {
    return this.http
      .get<{
        plus_code: any,
        results: any[],
        status: string
        }>
        (`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.googleMapsAPIKey}`
      )
      .pipe(
        map(geodata => {
          const { results } = geodata;
          if (!results || results.length === 0) {
            return null;
          }

          const { formatted_address } = results[0];
          return formatted_address;
        })
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${this.googleMapsAPIKey}`;
  }
}
