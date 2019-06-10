import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment  } from '../../../environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})

export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef;
  @Input() center = {
    lat: 6.6105511,
    lng: 3.3711926,
  };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';

  googleMaps: any;
  clickListener: any;

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.getGoogleMaps()
      .then( (googleMaps: any) => {
        this.googleMaps = googleMaps;
        const mapEl = this.mapElementRef.nativeElement;

        const map = new googleMaps.Map(mapEl, {
          center: this.center,
          zoom: 16
        });

        this.googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.renderer.addClass(mapEl, 'visible');
        });

        if (this.selectable) {
          this.clickListener = map.addListener('click', ({ latLng }) => {
            const selectedCoords = {
              lat: latLng.lat(),
              lng: latLng.lng()
            };

            this.modalCtrl.dismiss(selectedCoords);
          });
        }
        else {
          const marker = new googleMaps.Marker({
            map,
            position: this.center,
            title: 'Picked Location'
          });
          marker.setMap(map);
        }
      })
      .catch( err => {
        console.log(err);
      });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  private getGoogleMaps() {
    const win = window as any;
    const { googleMapsAPIKey } = environment;

    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsAPIKey}`;
      script.async = true;
      script.defer = true;

      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;

        if (loadedGoogleModule && loadedGoogleModule.maps) {
          return resolve(loadedGoogleModule.maps);
        }
        return reject('Google maps SDK not available.');
      };
    });

  }

  ngOnDestroy() {
    if (this.selectable && this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }
}
