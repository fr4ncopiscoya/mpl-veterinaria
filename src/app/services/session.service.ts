import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
// import { Menu } from '../interfaces/pide.interface';



@Injectable({
  providedIn: 'root'
})
export class SessionService {

  user_id = signal<number | null>(null);
  user_name = signal<string>('');
  // menus = signal<Menu[]>([])

  constructor(
    private route: Router
  ) {
    const savedId = localStorage.getItem('user-id');
    const savedUsername = localStorage.getItem('username');
    // const savedMenus = localStorage.getItem('menus');

    if (savedId) this.user_id.set(parseInt(savedId));
    if (savedUsername) this.user_name.set(savedUsername);
    // if (savedMenus) this.menus.set(JSON.parse(savedMenus));
  }

  // setDataSession(data: { id: number, username: string, menus: Menu[] }) {
  //   this.user_id.set(data.id);
  //   this.user_name.set(data.username);
  //   this.menus.set(data.menus);
  // }

  clearSession() {
    this.user_id.set(null);
    this.user_name.set('');
    // this.menus.set([])
    localStorage.clear();
    this.route.navigate(['/login']);
    // setTimeout(() => {
    // }, 1000);
  }
}
