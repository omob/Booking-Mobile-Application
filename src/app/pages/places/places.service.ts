import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from './../../auth/auth.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { take, map, delay, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from 'src/app/pages/places/location.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  // tslint:disable: variable-name
  private _url: string;
  private _places = new BehaviorSubject<Place[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {
    this._url = 'https://ionic-angular-app-42235.firebaseio.com';
   }

  get places(): Observable<Place[]> {
    return this._places.asObservable();
  }

  fetchPlaces(): Observable<Place[]> {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http
          .get<{[key: string]: PlaceData}>(`${this._url}/offered-places.json?auth=${token}`);
      }),
      map(resData => {
      const places = [];

      for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date( resData[key].availableTo),
                resData[key].userId,
                resData[key].location
                )
              );
          }
        }

      return places;
      }),
      tap(places => {
        return this._places.next(places); // returns places as an observable
      })
    );
  }


  getPlace(placeId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<PlaceData>(
          `${this.url}/offered-places/${placeId}.json?auth=${token}`
        );
      }),
      map(placeData => {
        if (placeData !== null) {
          return new Place(
                placeId,
                placeData.title,
                placeData.description,
                placeData.imageUrl,
                placeData.price,
                new Date(placeData.availableFrom),
                new Date(placeData.availableTo),
                placeData.userId,
                placeData.location);
        }
        throw new Error('Place not found');
      })
    );
  }

  updatePlace(placeId: string, newPlace: Place) {
    let placesCopy: Place[];
    let fetchedToken: string;

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
      }),
      take(1),
      switchMap( places => {
        if (!places || places.length === 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const index = places.findIndex( p => p.id === placeId );
        if (index !== -1) {
          placesCopy = [...places];
          const oldPlace = placesCopy[index];

          const updatedPlace = new Place(
            oldPlace.id,
            newPlace.title,
            newPlace.description,
            newPlace.imageUrl,
            newPlace.price,
            oldPlace.availableFrom,
            oldPlace.availableTo,
            oldPlace.userId,
            oldPlace.location );

          placesCopy[index] = updatedPlace;

          return this.http
            .put(
              `${this.url}/offered-places/${placeId}.json?auth=${fetchedToken}`,
              {...updatedPlace, id: null}
              );
          }
        }),
        tap(() => {
          this._places.next(placesCopy);
        })
      );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{imageUrl: string, imagePath: string}>(
          'https://us-central1-ionic-angular-app-42235.cloudfunctions.net/storeImage',
          uploadData,
          { headers: { Authorization: 'Bearer ' + token } }
        );
      })
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
      let generatedId: string;
      let newPlace: Place;
      let fetchedUserId: string;

      return this.authService.userId.pipe(
        take(1),
        switchMap(userId => {
          fetchedUserId = userId;
          return this.authService.token;
        }),
        take(1),
        switchMap(token => {
          if (!fetchedUserId) {
            throw new Error('No user found!');
          }

          newPlace = new Place(
            Math.random().toString(),
            title,
            description,
            imageUrl,
            price,
            dateFrom,
            dateTo,
            fetchedUserId,
            location);

          return this.http.post<{name: string}>(
            `${this.url}/offered-places.json?auth=${token}`,
            { ...newPlace, id: null }
          );
        }),
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap( places => {
          newPlace.id = generatedId;
          return this._places.next(places.concat(newPlace));
        })
      );
    }

  get url() {
    return this._url;
  }

}

// format of data from firebase
interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}
