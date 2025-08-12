import { Component } from '@angular/core';
import { CarrouselComponent } from './components/carousel/carousel.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [CarrouselComponent, CategoriesComponent, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: '../../../assets/scss/style.scss'
  // styleUrl: './inicio.component.css'
})
export default class InicioComponent {

}
