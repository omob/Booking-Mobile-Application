import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private _bookings = new BehaviorSubject<Booking[]>([]);
  private _url;

  constructor(private authService: AuthService, private http: HttpClient) {
    this._url = 'https://ionic-angular-app-42235.firebaseio.com';
  }

  get bookings() {
    return this._bookings.asObservable();
  }


  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ){

    let generatedId;
    let newBooking;
    let fetchUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found');
        }
        fetchUserId = userId;
        return this.authService.token;
        }),
      take(1),
      switchMap(token => {
        newBooking = new Booking(
          Math.random().toString(),
          placeId,
          fetchUserId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );

        return this.http.post<{name: string}>(
          `${this._url}/bookings.json?auth=${token}`,
          { ...newBooking, id: null}
        );
      }),
      switchMap( resData => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  fetchBookings() {
    let fetchUserId: string;

    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error ('No user ID');
        }
        fetchUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        return this.http
        .get<{ [key: string]: BookingData }>(`
          ${this._url}/bookings.json?orderBy="userId"&equalTo="${
          fetchUserId
          }"&auth=${token}`
        );
      }),
      map(bookingData => {
        const bookings = [];
        for (const key in bookingData) {
          if (bookingData.hasOwnProperty(key)) {
            const {
              dateFrom,
              dateTo,
              firstName,
              guestNumber,
              lastName,
              placeId,
              placeImage,
              placeTitle,
              userId
            } = bookingData[key];

            bookings.push(
              new Booking(
                key, placeId, userId, placeTitle,
                placeImage, firstName, lastName, guestNumber,
                new Date(dateFrom), new Date(dateTo)
              )
            );
          }
        }
        return bookings;
      }),
      tap( bookings => this._bookings.next(bookings))
    );
  }

  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `${this._url}/bookings/${bookingId}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.bookings;
      }),
      take(1),
      tap( bookings => {
        this._bookings.next( bookings.filter(({id}) => id !== bookingId ));
      })
    );
  }

}

interface BookingData {
  dateFrom: string;
  dateTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}