import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { PlacesService } from './../../places.service';
import { Router } from '@angular/router';
import { Place } from './../../place.model';
import { LoadingController } from '@ionic/angular';
import { PlaceLocation } from 'src/app/pages/places/location.model';
import { switchMap } from 'rxjs/operators';

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
        location: new FormControl( null, Validators.required),
        image: new FormControl(null)
      }
    );
  }

  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({
      location
    });
  }

  onImagePicked(imageData: string | File) {

    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile =  base64toBlob(
          imageData.replace('data:image/jpeg;base64,', ''),
          'image/jpeg'
        );
      } catch (error) {
        console.log('Here', error);
        return;
      }

    } else {
      imageFile = imageData;
    }

    console.log('ImageFile ', imageFile);
    this.form.patchValue({ image: imageFile });
  }

  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image').value) {
      return;
    }

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
        .uploadImage(this.form.get('image').value)
        .pipe(
          switchMap(uploadResponse => {
            return this.placesService
              .addPlace(
                place.title,
                place.description,
                place.price,
                place.dateFrom,
                place.dateTo,
                place.location,
                uploadResponse.imageUrl);
          })
        )
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

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = window.atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}
