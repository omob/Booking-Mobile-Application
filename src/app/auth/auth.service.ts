import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthResponsePayload } from './authresponse.model';
import { User } from './user.model';
import { Plugins } from '@capacitor/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy{
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer;

  constructor(private http: HttpClient) { }

  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData'}))
      .pipe(
        map(storedData => {
          if (!storedData || !storedData.value) {
            return null;
          }

          const parsedData = JSON.parse(storedData.value) as {
            token: string;
            userId: string;
            tokenExpirationDate: string;
            email: string;
          };

          const { token, userId, tokenExpirationDate, email } = parsedData;

          const expirationTime = new Date(tokenExpirationDate);

          if (expirationTime <= new Date()) {
            return null;
          }
          const user = new User(
            userId,
            email,
            token,
            expirationTime
          );
          return user;
        }),
        tap(user => {
          if (user) {
            this._user.next(user);
            this.autoLogout(user.tokenDuration);
          }
        }),
        map(user => {
          return !!user;
        })
      );
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  get userIsAuthenticated() {
    return this._user.asObservable()
      .pipe(
        map(user => {
          if (user) {
            return !!user.token;
          }
          return false;
        }
      ));
  }

  get userId() {
    return this._user.asObservable()
      .pipe(map( user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
      );
  }

  get token() {
    return this._user.asObservable()
      .pipe(
        map(user => {
          if (user) {
            return user.token;
          } else {
            return null;
          }
        })
      );
  }

  signupOrLogin(email: string, password: string, mode: 'signup' | 'login') {
    let url;
    if (mode === 'login') {
      url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${
        environment.firbaseAPIKey
      }`;
    } else {
      url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${
        environment.firbaseAPIKey
      }`;
    }

    return this.http.post<AuthResponsePayload>(
      url,
      { email, password, returnSecureToken: true }
    )
    .pipe(
      map(userData => {
        const { idToken, email, expiresIn, localId, } = userData;
        const expirationTime = new Date(new Date().getTime() + (+expiresIn * 1000));

        const user = new User(
          localId,
          email,
          idToken,
          expirationTime
        );
        this._user.next(user);
        this.autoLogout(user.tokenDuration);

        this.storeAuthData(
          userData.localId,
          userData.idToken,
          expirationTime.toISOString(),
          email
        );
      })
    );
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({ key: 'authData' });
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationData: string,
    email: string
  ) {

    const data = JSON.stringify({ userId, token, tokenExpirationData, email });

    Plugins.Storage.set({key: 'authData', value: data});
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

}
