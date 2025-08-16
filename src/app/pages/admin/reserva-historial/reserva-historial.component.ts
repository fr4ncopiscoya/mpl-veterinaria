import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { VeterinariaService } from '../../../services/veterinaria.service';
import { DataServicios } from '../../../interfaces/veterinaria.interface'
import { CommonModule } from '@angular/common';
import { GridService } from '../../../services/grid.service';
import { h } from 'gridjs';

@Component({
  selector: 'app-reserva-historial',
  imports: [CommonModule],
  templateUrl: './reserva-historial.component.html',
  styleUrl: './reserva-historial.component.css'
})
export default class ReservaHistorialComponent implements OnInit {

  rowsReserva: {
    reserva_id: number;
    fecha_cita: string;
    hora_cita: string;
    nombre_cliente: string;
    nombre_mascota: string;
    nombre_servicio: string;
    observaciones: string;
    nombre_estado: string;
  }[] = [];

  private veterinariaService = inject(VeterinariaService);
  private gridService = inject(GridService);

  DATATABLE_ID = 'table-card';
  columnsReserva = signal<any[]>([]);

  dateToday = new Date().toISOString().split('T')[0]; // "2025-08-14"

  dataServicios = signal<DataServicios[]>([]);
  dataHistorialReserva = signal<any[][]>([]);
  // fechaInicio = signal<string>('');
  // fechaFin = signal<string>('');
  fechaInicio = signal<string>(this.dateToday);
  fechaFin = signal<string>(this.dateToday);
  fechaCita = signal<string>('');
  servicio = signal<number>(0);
  estado = signal<number>(0);

  constructor(
  ) {
    effect(() => {
      const data = this.dataHistorialReserva();
      const columns = this.columnsReserva();

      if (data.length > 0) {
        this.gridService.destroy(this.DATATABLE_ID);
        this.gridService.render(this.DATATABLE_ID, columns, data, 5);
      }

      // (window as any).abrirModalPartida = (partida: number) => {
      //   this.abrirModal(partida);
      // };
    }
    )
  }

  ngOnInit(): void {
    this.getServicios();
  }

  resetFields() {
    this.fechaInicio.set(''),
      this.fechaFin.set(''),
      this.fechaCita.set(''),
      this.servicio.set(0),
      this.estado.set(0)
    this.gridService.destroy(this.DATATABLE_ID);
  }

  changeTipoEstado(value: number) {
    this.estado.set(value);
  }

  changeTipoServicio(value: number) {
    this.servicio.set(value);
  }

  getServicios() {
    const post = {}

    this.veterinariaService.getServicios(post).subscribe({
      next: (res) => {
        this.dataServicios.set(res);
      },
      error: (error) => {
        console.log('error: ', error);

      }
    })
  }

  changeEstado(id_reserva:number, estado:string ){
    console.log('id_reserva', id_reserva);
    console.log('estado', estado);

    const post = {
      reserva_id: id_reserva,
      estado_id: estado
    }

    this.veterinariaService.updReservaEstado(post).subscribe({
      next:(res)=>{
        console.log('res: ', res);
      },
      error:(error)=>{
        console.log('error: ', error);
        
      }
    })
  }

  searchReservas() {
    this.gridService.destroy(this.DATATABLE_ID);
    const post = {
      FechaInicio: this.fechaInicio(),
      FechaFin: this.fechaFin(),
      FechaExacta: this.fechaCita(),
      ServicioId: this.servicio(),
      EstadoId: this.estado()
    }

    this.columnsReserva.set([
      { name: "ID" },
      { name: "Fecha Cita" },
      { name: "Hora Cita" },
      { name: "Nombre cliente" },
      { name: "Nombre mascota" },
      { name: "Servicio" },
      { name: "Observaciones" },
      {
        name: "Estado",
        formatter: (cell: string, row: any) => {
          const select = h('select', {
            className: 'form-select form-select-sm',
            onchange: (e: any) => {
              const nuevoEstado = e.target.value;
              this.changeEstado(row.cells[0].data, nuevoEstado); // row.cells[0] = ID
            }
          }, [
            h('option', { value: '1', selected: cell === 'Pendiente' }, 'Pendiente'),
            h('option', { value: '2', selected: cell === 'Atendida' }, 'Atendida'),
            h('option', { value: '3', selected: cell === 'Cancelada' }, 'Cancelada'),
          ]);
          return select;
        }
      }

    ]);

    this.veterinariaService.getReservaCita(post).subscribe({
      next: (res: any[]) => {
        console.log('res-historial: ', res);

        const data = res.map(r => [
          r.reserva_id,
          r.fecha_cita,
          r.hora_cita,
          r.nombre_cliente,
          r.nombre_mascota,
          r.nombre_servicio,
          r.observaciones,
          r.nombre_estado
        ]);

        this.gridService.render(
          this.DATATABLE_ID,
          this.columnsReserva(),
          data, // 🔹 Aquí ya va como array de arrays
          8
        );
      },
      error: (error) => {
        console.log('error: ', error);
      }
    });

  }

}
