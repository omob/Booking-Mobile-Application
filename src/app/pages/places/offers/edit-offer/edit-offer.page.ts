import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from './../../places.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { Place } from './../../place.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

  placeId: string;
  form: FormGroup;
  private _placeSubscription: Subscription;
  isLoading: boolean = false;
  placeError = false;

  constructor(
    private route: ActivatedRoute,
    private placesServices: PlacesService,
    private navCtrl: NavController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController ) { }

  ngOnInit() {
    this.placeId = this.route.snapshot.paramMap.get('placeId');
    if (!this.placeId) {
      this.navCtrl.navigateBack('/places/tabs/offers');
      return;
    }

    this.isLoading = true;

    this._placeSubscription = this.placesServices
      .getPlace(this.placeId)
      .subscribe(place => {
        if (place !== null){
          this.form = new FormGroup({
            title: new FormControl(place.title, Validators.required),
            description: new FormControl(
              place.description,
              [ Validators.required, Validators.maxLength(180) ]
            ),
            imageUrl: new FormControl(place.imageUrl, Validators.required),
            price: new FormControl(place.price, Validators.required )
          });
        }
        this.isLoading = false;
      },
      error => {
        this.alertCtrl.create({
          header: 'An error occured!',
          message: 'Place not found',
          buttons: [{ text: 'Okay', handler: () => {
            this.router.navigate(['/places/tabs/offers']);
          }}]
        })
        .then( alertEl => {
          alertEl.present();
        });
      });
  }

  get description() {
    return this.form.get('description');
  }

  async onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }

    this.loadingCtrl
    .create({ message: 'Updating place...'})
    .then(loadingEl => {
      loadingEl.present();

      this.placesServices.updatePlace(this.placeId, this.form.value)
        .subscribe(() => {
          loadingEl.dismiss();

          this.router.navigateByUrl(`/places/tabs/offers`);
        });
    });
  }

  ngOnDestroy(): void {
    if (this._placeSubscription) {
      this._placeSubscription.unsubscribe();
    }
  }
}
