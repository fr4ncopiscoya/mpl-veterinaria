import {Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = false;

  get isLoggedIn(): boolean {
    return this._isLoggedIn || !!localStorage.getItem('session-logged');
  }

  login(token: string) {
    localStorage.setItem('session-logged', token);
    this._isLoggedIn = true;
  }

  logout() {
    localStorage.removeItem('session-logged');
    localStorage.clear();
    this._isLoggedIn = false;
  }
}
