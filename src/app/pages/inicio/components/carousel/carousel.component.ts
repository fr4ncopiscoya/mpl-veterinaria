import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface carousel{
  image: string,
  name: string,
  link: string
}

@Component({
  selector: 'app-carrousel',
  imports: [RouterLink],
  templateUrl: './carousel.component.html',
})
export class CarrouselComponent {

  carouselItems:carousel[] = [
    {
      image: '../../../../../assets/images/banner_hero.png',
      name: 'Mascotas',
      link: '/veterinaria/reserva'
    },
    {
      image: '../../../../../assets/images/flayer-adiestrador.jpg',
      name: 'Adiestradores',
      link: ''
    },
    {
      image: '../../../../../assets/images/flayer-veterinaria.jpg',
      name: 'Reservar Citas',
      link: ''
    }
  ]

}
