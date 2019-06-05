import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanLoad, Route, UrlSegment } from '@angular/router';
import { CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanLoad {

  constructor(private authService: AuthService, private router: Router) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
      if (this.authService.userIsAuthenticated) {
        return true;
      }

      this.router.navigateByUrl('/auth');
  }

  canLoad(route: Route, segments: UrlSegment[])
  : Observable<boolean> | Promise<boolean> | boolean {
      if (this.authService.userIsAuthenticated) {
        return true;
      }
      this.router.navigateByUrl('/auth');
  }

}
