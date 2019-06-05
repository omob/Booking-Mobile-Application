import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  isLoading: boolean;
  isLoginSwitch: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.authService.userIsAuthenticated ) {
      this.router.navigate(['/places/tabs/discover']);
    }
  }

  onLogin() {
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...'})
      .then(loadingEl => {
        loadingEl.present();
        setTimeout(() => {
          const login = this.authService.login();
          if (login) {
            this.router.navigate(['/places/tabs/discover']);
          }
          loadingEl.dismiss();
        }, 3000 );
      });
  }

  onSubmit(form: NgForm) {
    if (!form.valid) { return; }

    const formDetail = form.value;

    if (this.isLoginSwitch) {
      //send a request to login server
      console.log(formDetail);
      this.onLogin();
    }
    else {
      //send a request to signup server
    }

  }

  onSwitchAuthMode() {
    this.isLoginSwitch = !this.isLoginSwitch;
  }

}
