import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PlaceLocation } from 'src/app/pages/places/location.model';
import { MapModalComponent } from './../../map-modal/map-modal.component';
import { LocationService } from './location.service';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  @Output() locationPick = new EventEmitter<PlaceLocation>();

  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private locationService: LocationService) { }

  ngOnInit() {}

  onPickLocation() {
    this.modalCtrl.create({
      component: MapModalComponent
    })
    .then(modalEl => {
      modalEl.onDidDismiss().then( async modalData => {
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

        try {
          const address = await this.locationService.getAddress(lat, lng);
          pickedLocation.address = address;

          const image = this.locationService.getMapImage(lat, lng, 16);
          pickedLocation.staticMapImageUrl = image;
          this.selectedLocationImage = image;

          this.isLoading = false;
          this.locationPick.emit(pickedLocation);
        }
        catch (e) {
          console.error('ERROR GETTING ADDRESS', e);
          this.isLoading = false;
        }
      });

      modalEl.present();
    });
  }
}
