import { Component } from '@angular/core';

interface servicios {
  image: string,
  title: string,
  text: string,
}

@Component({
  selector: 'app-servicios',
  imports: [],
  templateUrl: './servicios.component.html',
})
export class ServiciosComponent {

  categoriesItems: servicios[] = [
    {
      image: '../../../../../assets/images/mascota.jpg',
      title: 'Registra a tu Mascota (carnet digital)',
      text: 'Registra tu mascota aqui y obten su carnet para una mejor identificación.',
    },
    {
      image: '../../../../../assets/images/adiestrador.jpg',
      title: 'Registrate como paseador y/o adiestrador',
      text: 'Registra a tu paseador y/o adiestrador para una mejor identificación.',
    },
    {
      image: '../../../../../assets/images/veterinarian.jpg',
      title: 'Reserva tu cita en la veterinaria',
      text: 'Por el momento no contamos con este servico, pero muy pronto estará activo.',
    }
  ]

}
