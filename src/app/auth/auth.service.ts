import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isUserLoggedIn: boolean = true;
  private _userId: string = "xyz";

  constructor() { }

  get userIsAuthenticated(): boolean {
    return this._isUserLoggedIn;
  }

  login(): boolean {
    this._isUserLoggedIn = true;
    return true;
  }

  logout(): boolean {
    this._isUserLoggedIn = false;

    if (!this.userIsAuthenticated) {
      return true;
    }
  }

  get userId() {
    return this._userId;
  }
}
