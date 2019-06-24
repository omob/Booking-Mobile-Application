import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Capacitor, Plugins } from '@capacitor/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
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
  @Input() showPreview = false;

  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private locationService: LocationService) { }

  ngOnInit() {
    console.log('SHow preview', this.showPreview);
  }

  onPickLocation() {

    this.actionSheetCtrl.create({
      header: 'Please Choose',
      buttons: [
        {
          text: 'Auto-Locate',
          handler: () => {
            this.locateUser();
          }
        },
        {
          text: 'Pick on Map',
          handler: () => {
            this.openMap();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    })
    .then( actionSheetEl => actionSheetEl.present() );

  }


  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }

    this.isLoading = true;
    Plugins.Geolocation.getCurrentPosition()
      .then(({coords}) => {
        this.createPlace(coords.latitude, coords.longitude);
        this.isLoading = false;
      })
      .catch( err => {
        this.showErrorAlert();
        this.isLoading = false;
      });
  }

  private showErrorAlert() {
    this.alertCtrl.create({
      header: 'Could not fetch location',
      message: 'Please use the map to pick a location',
      buttons: ['Okay']
    })
    .then( alertEl => alertEl.present() );
  }

  private openMap() {
    this.modalCtrl.create({
      component: MapModalComponent
    })
    .then(modalEl => {
      modalEl.onDidDismiss().then( async modalData => {
        const { data: latLng } = modalData;
        if (!latLng) {
          return;
        }
        const { lat, lng } = latLng;

        this.createPlace(lat, lng);
      });

      modalEl.present();
    });
  }

  private async createPlace( lat: number, lng: number) {
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

    } catch (e) {
      console.error('ERROR GETTING ADDRESS', e);
      this.isLoading = false;
    }
  }
}
