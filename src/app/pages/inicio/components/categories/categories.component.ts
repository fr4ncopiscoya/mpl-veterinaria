import { Component } from '@angular/core';

interface categories{
  image: string,
  title: string,
  text: string,
  textButton: string,
  link: string
}

@Component({
  selector: 'app-categories',
  imports: [],
  templateUrl: './categories.component.html',
  // styleUrl: './categories.compontent.css'
  styleUrl: '../../../../../assets/scss/style.scss'
})
export class CategoriesComponent {

  categoriesItems:categories[] = [
    {
      image: '../../../../../assets/images/mascota.jpg',
      title: 'Registra a tu Mascota (carnet digital)',
      text: 'Registra tu mascota aqui y obten su carnet para una mejor identificación.',
      textButton: 'Registrar',
      link: 'https://portal.muniplibre.gob.pe/empadronamiento-mascotas/m-add/'
    },
    {
      image: '../../../../../assets/images/adiestrador.jpg',
      title: 'Registrate como paseador y/o adiestrador',
      text: 'Registra a tu paseador y/o adiestrador para una mejor identificación.',
      textButton: 'Registrar',
      link: 'https://portal.muniplibre.gob.pe/empadronamiento-paseador-adiestrador/m-add/'
    },
    {
      image: '../../../../../assets/images/veterinarian.jpg',
      title: 'Reserva tu cita en la veterinaria',
      text: 'Por el momento no contamos con este servico, pero muy pronto estará activo.',
      // text: 'Reserva una cita en la veterinaria de Pueblo Libre para atender a tu mascota.',
      textButton: 'Reservar',
      link: 'https://apps.muniplibre.gob.pe/veterinaria/veterinaria/reserva'
    }
  ]

}
