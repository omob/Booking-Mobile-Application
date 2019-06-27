import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanLoad, Route, UrlSegment } from '@angular/router';
import { CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';

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
    return this.authService.userIsAuthenticated.pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          console.log('Can activate Not authenticated')
          return this.authService.autoLogin();
        } else {
          return of(isAuthenticated);
        }
      }),
      tap(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigateByUrl('/auth');
        }
      })
    );
  }

  canLoad(route: Route, segments: UrlSegment[])
  : Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.userIsAuthenticated.pipe(
      take(1),
      switchMap(isAuthenticated => {
        console.log(isAuthenticated);
        if (!isAuthenticated) {
          console.log('Can load Not authenticated')
          return this.authService.autoLogin();
        } else {
          return of(isAuthenticated);
        }
      }),
      tap(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigateByUrl('/auth');
        }
      })
    );
  }

}
