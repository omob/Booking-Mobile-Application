import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor, Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { AuthService } from './auth/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {

    this.platform.ready().then(() => {
       if (Capacitor.isPluginAvailable('SplashScreen')) {
         Plugins.SplashScreen.hide();
       }
    });
  }

  onLogout() {
    if (this.authService.logout()) {
      this.router.navigateByUrl('/auth');
    }
  }

}
