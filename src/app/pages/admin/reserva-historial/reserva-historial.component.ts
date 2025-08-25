import { Component, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { VeterinariaService } from '../../../services/veterinaria.service';
import { DataServicios } from '../../../interfaces/veterinaria.interface'
import { CommonModule } from '@angular/common';
import { GridService } from '../../../services/grid.service';
import { FormsModule } from '@angular/forms'; // For [(ngModel)]
import { h } from 'gridjs';
import { ModalComponent } from "../../../components/modal/modal.component";
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { UppercaseDirective } from "../../../shared/directives/uppercase.directive";

interface EstadoReserva {
  estado_id: number;
  estado_descri: string;
}

@Component({
  selector: 'app-reserva-historial',
  imports: [CommonModule, ModalComponent, FormsModule, UppercaseDirective],
  templateUrl: './reserva-historial.component.html',
  styleUrl: './reserva-historial.component.css'
})
export default class ReservaHistorialComponent implements OnInit {

  @ViewChild('editarReserva') editarReservaModal!: ModalComponent;

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
  private sweetAlertService = inject(SweetAlertService);

  DATATABLE_ID = 'table-card';
  columnsReserva = signal<any[]>([]);

  dataRow: any;
  dataEstadoReserva = signal<EstadoReserva[]>([]);

  //DATA RESERVA
  reserva_id = signal<number>(0);
  cliente_nombre = signal<string>('');
  cliente_mascota = signal<string>('');
  cita_hora = signal<string>('');
  cita_fecha = signal<string>('');
  cita_servicio = signal<string>('');
  cita_observaciones = signal<string>('');
  reserva_estado = signal<number>(0);

  dateToday: string = (() => {
    const today = new Date();
    return today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
  })();


  dataServicios = signal<DataServicios[]>([]);
  dataHistorialReserva = signal<any[][]>([]);
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
    this.searchReservas();
    this.getEstadoReserva();
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
  getEstadoReserva() {
    const post = {}

    this.veterinariaService.getEstadoReserva(post).subscribe({
      next: (res) => {
        console.log('res: ', res);
        this.dataEstadoReserva.set(res);
      },
      error: (error) => {
        console.log('error: ', error);

      }
    })
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

  changeEstado(id_reserva: number, estado: string) {
    console.log('id_reserva', id_reserva);
    console.log('estado', estado);

    const post = {
      reserva_id: id_reserva,
      estado_id: estado
    }

    this.veterinariaService.updReservaEstado(post).subscribe({
      next: (res) => {
        console.log('res: ', res);
      },
      error: (error) => {
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
    };

    const self = this; // ⚡ aseguramos el contexto

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
        formatter: (cell: string) => {
          const statusCita = cell;
          let statusClass = '';
          switch (statusCita) {
            case 'Pendiente':
              statusClass = 'bg-primary text-white';
              break;
            case 'Atendida':
              statusClass = 'bg-success text-white';
              break;
            case 'Cancelada':
              statusClass = 'bg-danger text-white';
              break;
          }
          return h('span', { className: `badge ${statusClass} p-1 rounded` }, cell);
        }
      },
      {
        name: "Acciones",
        formatter: (cell: string, row: any) => {
          // 🔹 obtiene el ID desde la primera columna
          const reservaId = row.cells[0].data;

          // 🔹 busca el objeto completo en this.dataRow
          const item = self.dataRow.find((r: any) => r.reserva_id === reservaId);

          return h('div', { className: 'text-end d-flex gap-1' }, [
            h('a', {
              className: 'text-muted px-1 d-block viewlist-btn cursor-pointer',
              title: 'Editar Reserva',
              // onclick: () => console.log('reserva data: ', item) // ahora SI sale el objeto completo
              onclick: () => self.openEditReserva(item)
            }, h('i', { className: 'bi bi-pencil-fill' })),
          ]);
        }
      }

    ]);

    this.veterinariaService.getReservaCita(post).subscribe({
      next: (res: any[]) => {
        console.log('res-historial: ', res);

        this.dataRow = res; // 🔹 aquí guardamos la data original

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
          data,
          8
        );
      },
      error: (error) => {
        console.log('error: ', error);
      }
    });
  }

  openEditReserva(data: any) {
    this.reserva_id.set(data.reserva_id);
    this.cliente_nombre.set(data.nombre_cliente);
    this.cliente_mascota.set(data.nombre_mascota);
    this.cita_hora.set(data.hora_cita);
    this.cita_fecha.set(data.fecha_cita);
    this.cita_servicio.set(data.nombre_servicio);
    this.cita_observaciones.set(data.observaciones);
    this.reserva_estado.set(data.estado_id);
    this.editarReservaModal.open();
  }


  updateReserva() {
    const post = {
      reserva_id: this.reserva_id(),
      estado_id: this.reserva_estado(),
      observaciones: this.cita_observaciones(),
      nombre_mascota: this.cliente_mascota().toLocaleUpperCase()
    }
    // console.log('post: ', post);
    if (this.cliente_mascota().length < 3) {
      this.sweetAlertService.info('', 'Por favor digite un nombre de mascota mayor a tres caracteres')
    } else {
      this.veterinariaService.updReservarCita(post).subscribe({
        next: (res) => {
          this.sweetAlertService.success('', res[0].mensaje);
          this.editarReservaModal.close();
          setTimeout(() => {
            this.searchReservas();
          }, 200);
        },
        error: (error) => {
          this.sweetAlertService.error('', error)
        }
      })
    }
  }

}
