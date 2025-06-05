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

  carouselOptions:carousel[] = [
    {
      image: '../../../assets/images/mascota.jpg',
      name: 'registra mascota',
    },
    {
      image: '../../../assets/images/mascota.jpg',
      name: 'registra adiestrador',
    },
    {
      image: '../../../assets/images/mascota.jpg',
      name: 'reserva una cita',
    }
  ]

}
