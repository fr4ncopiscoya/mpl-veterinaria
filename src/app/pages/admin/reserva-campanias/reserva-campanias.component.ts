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
import { ModalComponent } from "../../../components/modal/modal.component";
import { GridService } from '../../../services/grid.service';

interface HorarioDisponible {
  hora_disponible: string;
}

interface DataServicios {
  servicio_id: number,
  servicio_descri: string,
  servicio_precio: number,
  servicio_tipo: number
}

@Component({
  selector: 'app-reserva-campanias',
  imports: [CommonModule, FormsModule, MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule],
  templateUrl: './reserva-campanias.component.html',
  styleUrl: './reserva-campanias.component.css'
})
export default class ReservaCampaniasComponent implements OnInit{

  
  private veterinariaService = inject(VeterinariaService);
  private gridService = inject(GridService);
  private sweetAlertService = inject(SweetAlertService);

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
      const data = this.dataHistorialReserva();
      const columns = this.columnsReserva();

      if (data.length > 0) {
        this.gridService.destroy(this.DATATABLE_ID);
        this.gridService.render(this.DATATABLE_ID, columns, data, 5);
      }

        this.bloq_fecha.set(fecha);
        this.fun_getHorarios(fecha);
        this.getServiciosDisponibles(fecha);
      }
    });



  }


  dataHistorialReserva = signal<any[][]>([]);
  // almacenar - data 
  dataFechasDisponibles = signal<string[]>([]);
  dataHorariosDisponibles = signal<string[]>([]);
  dataServicios = signal<DataServicios[]>([]);
  

  selectedDate = signal<Date | null>(null);

  //Parametros bloquear fecha
  bloq_fecha = signal<string>('');
  bloq_horaini = signal<string>('');
  bloq_horafin = signal<string>('');
  bloq_servicio_id = signal<number>(0);
  bloq_intervalo = signal<number>(0);

  // filtro del datepicker
  filterDates = (date: Date | null): boolean => {
    if (!date) return false;
    const dateStr = date.toLocaleDateString('sv-SE'); // YYYY-MM-DD
    // const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    return this.dataFechasDisponibles().includes(dateStr);
  };


  ngOnInit(): void {
    this.fun_getFechasReserva();
    this.funListarCampana();
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

  getServiciosDisponibles(date: string) {
    const post = {
      p_fecha: date
    };

    this.veterinariaService.getServiciosDisponibles(post).subscribe({
      next: (res) => {
        this.dataServicios.set(res);
      },
      error: (error) => {
        console.error('error: ', error);
      }
    });
  }

  getServicio(id:number){
  
    console.log('servicio id',id);
  }

  fun_asignarCampana(){
    const post = {
      p_servicio: this.bloq_servicio_id(),
      p_fecha: this.bloq_fecha(),
      p_horaini: this.bloq_horaini(),
      p_horafin: this.bloq_horafin(),
      p_intervalo:this.bloq_intervalo(),
    };
    
    this.veterinariaService.insCampanias(post).subscribe({
      next:(res) => {
        const estado = res[0].estado  // codigo estado
        const mensaje = res[0].mensaje  // mensaje respuesta
        
        if (estado == 0) {
          this.sweetAlertService.error('', mensaje)
        } else {
          this.sweetAlertService.success('', mensaje);
        }
      },
      error:(error)=>{
        console.log('errror', error);
        this.sweetAlertService.error('', error)
      }
    })
  }

  isFormValid():boolean {
    return this.bloq_fecha() !== '' && this.bloq_horafin() !== '' && this.bloq_horaini() !== '' && this.bloq_servicio_id() !== 0 && this. bloq_intervalo() !== 0
  }
  funListarCampana() {
    this.gridService.destroy(this.DATATABLE_ID);

    const post = {}; // Si no necesitas filtros, lo puedes dejar vacío

    this.columnsReserva.set([
      { name: 'Fecha' },
      { name: 'Hora Inicio' },
      { name: 'Hora Fin' },
      { name: 'Servicio Descripción' },
      { name: 'Intervalo' },
    ]);

    this.veterinariaService.listCampanias(post).subscribe({
      next: (res: any[]) => {
        console.log('res-campania: ', res);

        this.dataRow = res;
        const data = res.map(r => [
          r.hcamp_fecha,
          r.hcamp_horafin,
          r.hcamp_horaini,
          r.servicio_descri,
          r.hcamp_duracion,
        ]);

        this.gridService.render(
          this.DATATABLE_ID,
          this.columnsReserva(),
          data,
          this.columnsReserva().length // cantidad real de columnas
        );
      },
      error: (error) => {
        console.log('Error listando campaña:', error);
        this.sweetAlertService.error('', error);
      },
    });
  }


}


