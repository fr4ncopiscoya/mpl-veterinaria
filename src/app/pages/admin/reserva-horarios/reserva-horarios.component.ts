import { Component, signal, ViewChild } from '@angular/core';
import { ModalComponent } from "../../../components/modal/modal.component";
import { CommonModule } from '@angular/common';
import { DataServicios } from '../../../interfaces/veterinaria.interface'

@Component({
  selector: 'app-reserva-horarios',
  imports: [ModalComponent, CommonModule],
  templateUrl: './reserva-horarios.component.html',
  styleUrl: './reserva-horarios.component.css'
})
export default class ReservaHorariosComponent {

  dataServicios = signal<DataServicios[]>([]);
  bfecha_motivo = signal<string>('');

  @ViewChild('bloqDate') bloquearFecha!: ModalComponent;
  @ViewChild('bloqHour') bloquearHorario!: ModalComponent;
  @ViewChild('setCampania') asignarCampania!: ModalComponent;

  openBloqDate(){
    this.bloquearFecha.open();
  }
  openBloqHour(){
    this.bloquearHorario.open();
  }
  openSetCampania(){
    this.asignarCampania.open();
  }

}
