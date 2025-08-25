import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  private route = inject(Router);
  private authService = inject(AuthService);

  username = signal<string>('');
  name = signal<string>('');
  apepaterno = signal<string>('');
  role = signal<string>('');

  constructor() {

    const userData = JSON.parse(localStorage.getItem('user-data') || '{}');
    this.username.set(userData.user_name);
    this.name.set(userData.persona_nombre)
    this.apepaterno.set(userData.persona_apepaterno);
    this.role.set(userData.roles);
  }


  clearSession() {
    this.authService.logout();
    this.route.navigate(['/login']);
  }
}
