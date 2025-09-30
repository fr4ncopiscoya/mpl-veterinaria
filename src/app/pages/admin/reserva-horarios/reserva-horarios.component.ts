import { afterNextRender, Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataServicios } from '../../../interfaces/veterinaria.interface'
import { VeterinariaService } from '../../../services/veterinaria.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { GridService } from '../../../services/grid.service';

interface HorarioDisponible {
  hora_disponible: string;
}

@Component({
  selector: 'app-reserva-horarios',
  imports: [CommonModule, FormsModule, MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,],
  templateUrl: './reserva-horarios.component.html',
  styleUrl: './reserva-horarios.component.css'
})
export default class ReservaHorariosComponent implements OnInit {

  private veterinariaService = inject(VeterinariaService);
  private sweetAlertService = inject(SweetAlertService);
  private gridService = inject(GridService);
  

  DATATABLE_ID = 'table-card';
  dataRow: any;
  columnsReserva = signal<any[]>([]);

  constructor() {
    effect(() => {
      const selected = this.selectedDate();

      if (selected) {
        console.log('selected: ', selected);

        const fecha = selected.toISOString().split('T')[0];
        console.log('fecha-convertida: ', fecha);

        // const year = selected.getFullYear();
        // const month = String(selected.getMonth() + 1).padStart(2, '0');
        // const day = String(selected.getDate()).padStart(2, '0');
        // const fecha = `${year}-${month}-${day}`;

        this.bloq_fecha.set(fecha);
        this.fun_getHorarios(fecha);
      }
    });
  }

  // almacenar - data 
  dataFechasDisponibles = signal<string[]>([]);
  dataHorariosDisponibles = signal<string[]>([]);

  selectedDate = signal<Date | null>(null);

  //Parametros bloquear fecha
  bloq_fecha = signal<string>('');
  bloq_horaini = signal<string>('');
  bloq_horafin = signal<string>('');
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
    this.funlistarHorarios();
  }

  fun_bloquearHorario() {
    const post = {
      p_fecha: this.bloq_fecha(),
      p_horaini: this.bloq_horaini(),
      p_horafin: this.bloq_horafin(),
      p_motivo: this.bloq_motivo(),
    }

    console.log('post: ', post);
    this.veterinariaService.insBloquearHorarios(post).subscribe({
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

  fun_getFechasReserva() {
    this.veterinariaService.getFechasDisponibles('').subscribe({
      next: (res: { fecha: string }[]) => {
        const fechasArray = res.map(f => f.fecha); // ["2025-09-17", "2025-09-18", ...]
        this.dataFechasDisponibles.set(fechasArray);
      },
      error: (err) => console.error('Error cargando fechas:', err),
    });
  }

  fun_getHorarios(date: string) {
    const post = { p_fecha: date };

    this.veterinariaService.getHorariosDisponibles(post).subscribe({
      next: (res: HorarioDisponible[]) => {
        const horas = res
          .map(item => item.hora_disponible)
          .sort((a, b) => {
            const [hA, mA] = a.split(':').map(Number);
            const [hB, mB] = b.split(':').map(Number);
            return hA * 60 + mA - (hB * 60 + mB);
          });
        this.dataHorariosDisponibles.set(horas);
      },
      error: (error) => {
        console.error('error: ', error);
        this.dataHorariosDisponibles.set([]);
      }
    });
  }

  isFormValid():boolean {
    return this.bloq_fecha() !== '' && this.bloq_horaini() !== '' && this.bloq_horafin() !== '' && this.bloq_motivo() !=='';
  }

  funlistarHorarios (){
    this.gridService.destroy(this.DATATABLE_ID);
    const post = {};

    this.columnsReserva.set([
      {name:'Fecha'},
      {name:'Hora inicio'},
      {name:'Hora fin'},
      {name:'Motivo'},
    ]);

    this.veterinariaService.listBloquearHorarios(post).subscribe({
      next:(res:any[]) =>{
        this.dataRow = res;
        const data = res.map(r => [
          r.hbloq_fecha,
          r.hbloq_horaini,
          r.hbloq_horafin,
          r.hbloq_motivo
        ]);

        this.gridService.render(
          this.DATATABLE_ID,
          this.columnsReserva(),
          data,
          this.columnsReserva().length // cantidad real de columnas
        );
      },
      error: (error) => {
        console.log('Error horario bloqueados:', error);
        this.sweetAlertService.error('', error);
      },
    })

  }

}
