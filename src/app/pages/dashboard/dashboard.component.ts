import { Component } from '@angular/core';
import { CarrouselComponent } from './components/carousel/carousel.component';
import { CategoriesComponent } from './components/categories/categories.component';

@Component({
  selector: 'app-dashboard',
  imports: [CarrouselComponent, CategoriesComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: '../../../assets/scss/style.scss'
  // styleUrl: './dashboard.component.css'
})
export default class DashboardComponent {

}
