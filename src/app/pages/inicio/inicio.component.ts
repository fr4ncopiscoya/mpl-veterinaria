import { Component } from '@angular/core';
import { CarrouselComponent } from './components/carousel/carousel.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { RouterLink } from '@angular/router';
import { ServiciosComponent } from "./components/servicios/servicios.component";

@Component({
  selector: 'app-inicio',
  imports: [CarrouselComponent, CategoriesComponent, RouterLink, ServiciosComponent, ServiciosComponent],
  templateUrl: './inicio.component.html',
  styleUrl: '../../../assets/scss/style.scss'
  // styleUrl: './inicio.component.css'
})
export default class InicioComponent {

}
