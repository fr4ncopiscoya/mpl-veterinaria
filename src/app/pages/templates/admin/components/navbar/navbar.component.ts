import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  private route = inject(Router);
  private authService = inject(AuthService);

  clearSession(){
    this.authService.logout();
    this.route.navigate(['/login']);
  }
}
