import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from './../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  googleMapsAPIKey;

  constructor(private http: HttpClient) {
    const { googleMapsAPIKey } = environment;
    this.googleMapsAPIKey = googleMapsAPIKey;
  }

  getAddress(lat: number, lng: number): Promise<string> {
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
      ).toPromise();
  }

  getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${this.googleMapsAPIKey}`;
  }

}
