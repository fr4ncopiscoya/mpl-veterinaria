import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // 1. Verificar login
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    // 2. Leer solo los roles de la ruta actual
    const requiredRoles = route.data['roles'] as string[] | undefined;

    // 3. Si hay roles definidos, validar
    if (requiredRoles && requiredRoles.length > 0) {
      if (!this.auth.hasPermission(requiredRoles)) {
        this.router.navigate(['/admin/inicio']);
        return false;
      }
    }

    return true;
  }
}



