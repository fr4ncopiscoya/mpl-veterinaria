import { Component } from '@angular/core';
import { MenuComponent } from "../../../components/menu/menu.component";
import { NavbarComponent } from "../../../components/navbar/navbar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reserva',
  imports: [MenuComponent,NavbarComponent,RouterOutlet],
  templateUrl: './reserva.component.html',
})
export default class InicioComponent {

}
