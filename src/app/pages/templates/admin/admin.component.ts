import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MenuComponent } from './components/menu/menu.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, NavbarComponent, MenuComponent],
  templateUrl: './admin.component.html',
})
export default class AdminComponent {

  pageTitle = 'BIENVENIDO';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let currentRoute = this.route.firstChild;
          while (currentRoute?.firstChild) {
            currentRoute = currentRoute.firstChild;
          }
          return currentRoute?.snapshot.data?.['title'] || '';
        })
      )
      .subscribe(title => {
        this.pageTitle = title;
      });
  }

}
