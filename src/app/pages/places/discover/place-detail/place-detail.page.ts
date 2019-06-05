import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CreateBookingComponent } from './../../../bookings/create-booking/create-booking.component';
import { Place } from './../../place.model';
import { PlacesService } from './../../places.service';
import { AuthService } from './../../../../auth/auth.service';
import { BookingService } from './../../../bookings/booking.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {

  place: Place;
  private _placeSubscription: Subscription;
  isLoading: boolean = false;
  isBookable;

  constructor(
    private navCtrl: NavController,
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private router: Router) { }

  ngOnInit() {
    const placeId = this.route.snapshot.paramMap.get('placeId');
    if (!placeId) {
      this.navCtrl.navigateBack('/places/tabs/offers');
      return;
    }

    this.isLoading = true;
    this._placeSubscription = this.placesService.getPlace(placeId)
      .subscribe(place =>  {
        this.place = place;
        this.isBookable = place.userId !== this.authService.userId;
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create(
          {
            header: 'An error occured!',
            message: 'Could not load place',
            buttons: [
              {
                text: 'Okay',
                handler: () => {
                  this.router.navigate(['/places/tabs/discover']);
                }
              }
            ]
          }
        )
        .then(alertEL => alertEL.present());
      });
  }

  onBookPlace() {
    // this.navCtrl.navigateBack(['/places/tabs/discover']);

    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    })
    .then(actionSheetCtrlEl => {
      actionSheetCtrlEl.present();
    });
  }

  private openBookingModal(mode: 'select' | 'random') {
    console.log(mode);

    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: {
        selectedPlace: this.place,
        selectedMode: mode
      }
     })
     .then(modal => {
       modal.present();
       return modal.onDidDismiss();
     })
     .then(({role, data}) => {
       if (role === 'confirm') {

        this.loadingCtrl
          .create({ message: 'Booking place...'})
          .then(loadingEl => {
            loadingEl.present();

            const { bookingData } = data;

            this.bookingService.addBooking(
               this.place.id,
               this.place.title,
               this.place.imageUrl,
               bookingData.firstName,
               bookingData.lastName,
               bookingData.guestNumber,
               bookingData.startDate,
               bookingData.endDate)
               .subscribe( () => {
                  loadingEl.dismiss();
                  // add message
               });
          });
       }
     });
  }

  ngOnDestroy(): void {
    if (this._placeSubscription) {
      this._placeSubscription.unsubscribe();
    }
  }
}