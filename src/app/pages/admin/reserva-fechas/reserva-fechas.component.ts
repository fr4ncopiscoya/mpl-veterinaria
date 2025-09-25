import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { VeterinariaService } from '../../../services/veterinaria.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { DataServicios } from '../../../interfaces/veterinaria.interface';

interface HorarioDisponible {
  hora_disponible: string;
}


@Component({
  selector: 'app-reserva-fechas',
  imports: [CommonModule, FormsModule, MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,],
  templateUrl: './reserva-fechas.component.html',
  styleUrl: './reserva-fechas.component.css'
})



export default class ReservaFechasComponent implements OnInit{

dataServicios = signal<DataServicios[]>([]);


private veterinariaService = inject(VeterinariaService);
  private sweetAlertService = inject(SweetAlertService);

  constructor() {
    effect(() => {
      const selected = this.selectedDate();

      if (selected) {
        const year = selected.getFullYear();
        const month = String(selected.getMonth() + 1).padStart(2, '0');
        const day = String(selected.getDate()).padStart(2, '0');
        const fecha = `${year}-${month}-${day}`;
        this.bloq_fecha.set(fecha);
      }
    });
  }

  // almacenar - data 
  dataFechasDisponibles = signal<string[]>([]);

  selectedDate = signal<Date | null>(null);

  //Parametros bloquear fecha
  bloq_fecha = signal<string>('');;
  bloq_motivo = signal<string>('');


  // filtro del datepicker
  filterDates = (date: Date | null): boolean => {
    if (!date) return false;
    const dateStr = date.toLocaleDateString('sv-SE'); // YYYY-MM-DD
    // const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('dateSTR: ', dateStr);
    
    return this.dataFechasDisponibles().includes(dateStr);
  };


  ngOnInit(): void {
    this.fun_getFechasReserva();
  }

  fun_bloquearFecha() {
    const post = {
      p_fecha: this.bloq_fecha(),
      p_motivo: this.bloq_motivo(),
    }

    console.log('post: ', post);

    if (this.bloq_fecha() == '' || this.bloq_motivo() == '') {
      this.sweetAlertService.info('', 'Completar todos los campos');
    } else {
      this.veterinariaService.insBloquearFechas(post).subscribe({
        next: (res) => {
          const estado = res[0].estado  // codigo estado
          const mensaje = res[0].mensaje  // mensaje respuesta

          if (estado == 0) {
            this.sweetAlertService.error('', mensaje)
          } else {
            this.sweetAlertService.success('', mensaje);
          }
        },
        error: (error) => {
          console.log('error: ', error);
          this.sweetAlertService.error('', error)
        }
      })
    }

  }

  fun_getFechasReserva() {
    this.veterinariaService.getFechasDisponibles('').subscribe({
      next: (res: { fecha: string }[]) => {
        const fechasArray = res.map(f => f.fecha); // ["2025-09-17", "2025-09-18", ...]
        this.dataFechasDisponibles.set(fechasArray);
      },
      error: (err) => console.error('Error cargando fechas:', err),
    });
  }

}
