import { Component } from '@angular/core';

interface carousel{
  image: string,
  name: string,
}

@Component({
  selector: 'app-carrousel',
  imports: [],
  templateUrl: './carousel.component.html',
})
export class CarrouselComponent {

  carouselItems:carousel[] = [
    {
      image: '../../../../../assets/images/flayer-pets.jpg',
      name: 'Mascotas',
    },
    {
      image: '../../../../../assets/images/flayer-adiestrador.jpg',
      name: 'Adiestradores',
    },
    {
      image: '../../../../../assets/images/flayer-veterinaria.jpg',
      name: 'Reservar Citas',
    }
  ]

}
