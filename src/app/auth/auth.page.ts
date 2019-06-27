import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  isLoading: boolean;
  isLoginSwitch = true;
  errorMessage = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.authService.userIsAuthenticated ) {
      this.router.navigate(['/places/tabs/discover']);
    }
  }

  onAuthenticate({email, password}, mode: 'signup' | 'login') {
    let message;
    message = mode === 'signup' ? 'Signing up.' : 'Loggin in';

    this.loadingCtrl
      .create({ keyboardClose: true, message: `${message}...`})
      .then(loadingEl => {
        loadingEl.present();

        this.authService.signupOrLogin(email, password, mode)
          .subscribe( () => {
            this.router.navigate(['/places/tabs/discover']);
            loadingEl.dismiss();
          }, ({error}) => {
            this.showAuthError(error);
            loadingEl.dismiss();
          });
      });
  }

  async showAuthError(errorRes) {
    console.log(errorRes)
    const { message } = errorRes.error;
    let messageRes;

    if (message === 'EMAIL_EXISTS') {
      messageRes = 'The email address is already in use by another account.';

    } else if (message === 'INVALID_PASSWORD' || message === 'EMAIL_NOT_FOUND') {
      messageRes = 'Invalid email or password';

    } else {
      messageRes = 'Could not authenticate your request at this time. Please try again later';
    }

    const alertEl = await this.alertCtrl.create({
      header: 'Authentication Failed',
      buttons: [ 'Okay' ],
      message: messageRes
    });

    alertEl.present();
  }

  onSubmit(form: NgForm) {
    if (!form.valid) { return; }

    this.isLoginSwitch ?
      this.onAuthenticate(form.value, 'login') :
      this.onAuthenticate(form.value, 'signup');

    form.reset();
  }

  onSwitchAuthMode() {
    this.isLoginSwitch = !this.isLoginSwitch;
  }

}
