import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn) {
      // Si ya está logeado, redirige a dashboard
      this.router.navigate(['/admin/inicio']);
      return false;
    }
    return true;
  }
}
