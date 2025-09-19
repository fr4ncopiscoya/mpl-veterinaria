import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataServicios } from '../../../interfaces/veterinaria.interface'
import { VeterinariaService } from '../../../services/veterinaria.service';

@Component({
  selector: 'app-reserva-horarios',
  imports: [CommonModule],
  templateUrl: './reserva-horarios.component.html',
  styleUrl: './reserva-horarios.component.css'
})
export default class ReservaHorariosComponent implements OnInit {

  private veterinariaService = inject(VeterinariaService);


  //Parametros bloquear fecha
  bloq_fecha = signal<string>('');
  bloq_horaini = signal<string>('');
  bloq_horafin = signal<string>('');
  bloq_motivo = signal<string>('');

  ngOnInit(): void {
    this.fun_getFechasReserva();
  }

  fun_bloquearHorario() {
    const post = {
      bloq_fecha: this.bloq_fecha(),
      bloq_horaini: this.bloq_horaini(),
      bloq_horafin: this.bloq_horafin(),
      bloq_motivo: this.bloq_motivo(),
    }

    this.veterinariaService.insBloquearHorarios(post).subscribe({
      next: (res) => {
        console.log('result: ', res);
      },
      error: (error) => {
        console.log('error: ', error);

      }
    })
  }

  fun_getFechasReserva() {
    this.veterinariaService.getFechasDisponibles('').subscribe({
      next: (res) => {
        console.log('result: ', res);
      },
      error: (error) => {
        console.log('error: ', error);
      }
    })
  }

  fun_getHorarios() {

  }

}
