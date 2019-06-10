import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {

  bookings: Booking[];
  bookingsSubscription: Subscription;
  isLoading = false;
  error = false;

  constructor(
    private bookingsService: BookingService,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.bookingsSubscription = this.bookingsService.bookings
      .subscribe( bookings => this.bookings = bookings);
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingsService.fetchBookings()
      .subscribe(
        () => { this.isLoading = false; },
        error => {
          this.isLoading = false;
          this.error = true;
        });
  }

  onCancelBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.loadingCtrl
      .create({message: 'Cancelling...'})
      .then(loadingEl => {
        loadingEl.present();

        this.bookingsService.cancelBooking(bookingId)
          .subscribe( () => {
            loadingEl.dismiss();
          });
      });
  }

  ngOnDestroy(): void {
   this.bookingsSubscription.unsubscribe();
  }
}
