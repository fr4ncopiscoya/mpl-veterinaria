import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _isLoggedIn = false;
  private userData: any = null;

  constructor() {
    const data = localStorage.getItem('user-data');
    if (data) {
      this.userData = JSON.parse(data);
    }
  }


  get isLoggedIn(): boolean {
    return this._isLoggedIn || !!localStorage.getItem('session-logged');
  }

  login(token: string, userData: any) {
    localStorage.setItem('session-logged', token);
    localStorage.setItem('user-data', JSON.stringify(userData));
    this._isLoggedIn = true;
  }

  logout() {
    localStorage.removeItem('session-logged');
    localStorage.clear();
    this._isLoggedIn = false;
  }

  /** Devuelve el objeto completo */
  getUserData(): any {
    return this.userData ?? JSON.parse(localStorage.getItem('user-data') || '{}');
  }

  /** Devuelve solo los roles */
  getRoles(): string[] {
    const user = this.getUserData();
    return user?.roles ?? [];
  }

  /** Verifica permisos */
  hasPermission(requiredRoles: string[]): boolean {
    const roles = this.getRoles();
    return requiredRoles.some(r => roles.includes(r));
  }

}
