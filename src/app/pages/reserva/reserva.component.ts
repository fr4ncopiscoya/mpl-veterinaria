import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { VeterinariaService } from '../../services/veterinaria.service';
import { SweetAlertService } from '../../services/sweet-alert.service';


interface DatosPersona {
  apPrimer: string;
  apSegundo: string;
  direccion: string;
  estadoCivil: string;
  foto: string;
  prenombres: string;
  restriccion: string;
  ubigeo: string;
}

interface DatosPersonaExtranjera {

  apepaterno: string,
  apematerno: string,
  nombres: string,
  calmigratoria: string
}

interface DataServicios {
  servicio_id: number,
  servicio_descri: string,
  servicio_precio: number,
  servicio_tipo: number
}

interface HorarioDisponible {
  hora_disponible: string;
}



interface DataRazas {
  raza_id: number;
  especie_id: number;
  raza_nombre: string;
}




@Component({
  selector: 'app-reserva',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatButtonModule,
    DatePipe
  ],
  templateUrl: './reserva.component.html',
  // styleUrl: ,
  styleUrls: [
    '../../../assets/scss/style.scss',
    './reserva.style.css',
  ]
})
export default class ReservaComponent implements OnInit {

  private veterinariaService = inject(VeterinariaService);
  private sweetAlertService = inject(SweetAlertService);

  dataReniec = signal<DatosPersona | null>(null);
  dataExtranjeria = signal<DatosPersonaExtranjera | null>(null);
  dataServicios = signal<DataServicios[]>([]);
  dataFechasDisponibles = signal<string[]>([]);
  dataHorarios = signal<string[]>([]);
  dataRazas = signal<any>('');
  // dataRazas = signal<string[]>([]);

  tipoDocumento = signal<string>('D');


  dateFormGroup: FormGroup;
  userFormGroup: FormGroup;
  petFormGroup: FormGroup;

  availableTimeSlots: string[] = [];

  constructor(private fb: FormBuilder) {
    this.dateFormGroup = this.fb.group({
      date: [null, Validators.required],
      time: [null, Validators.required],
      servicio: [null, Validators.required],
    });

    this.userFormGroup = this.fb.group({
      tipdoc: ['', Validators.required],
      numdoc: ['', Validators.required],
      nombres: [{ value: '', disabled: true }, Validators.required],
      apellidos: [{ value: '', disabled: true }, Validators.required],
      direccion: [{ value: '', disabled: true }, Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.minLength(9), Validators.required]],
    });

    this.userFormGroup.get('tipdoc')?.valueChanges.subscribe((tipo: string) => {
      this.changeTipoDocumento(tipo);
    });

    this.petFormGroup = this.fb.group({
      nombre: ['', Validators.required],
      especie: ['', Validators.required],
      raza: ['', Validators.required],
      // motivo: ['', Validators.required]
    });

    // actualiza las horas cuando cambia la fecha
    this.dateFormGroup.get('date')?.valueChanges.subscribe((date: Date) => {
      const formatted = date.toISOString().split('T')[0];
      console.log('formatted? ', formatted);

      this.getHorariosDisponibles(formatted);
      this.getServiciosDisponibles(formatted);
      this.dateFormGroup.get('time')?.reset();
    });
  }

  ngOnInit(): void {
    this.getFechasDisponibles();
  }

  filterDates = (date: Date | null): boolean => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return this.dataFechasDisponibles().includes(dateStr);
  };

  finalize() {
    
  }

  getFechasDisponibles() {
    const post = {};

    this.veterinariaService.getFechasDisponibles(post).subscribe({
      next: (res: { fecha: string }[]) => {
        const fechasArray = res.map(f => f.fecha);
        this.dataFechasDisponibles.set(fechasArray);
      },
      error: (error) => {
        console.error('error: ', error);
      }
    });
  }

  getHorariosDisponibles(date: string) {
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
        this.dataHorarios.set(horas);
      },
      error: (error) => {
        console.error('error: ', error);
        this.dataHorarios.set([]);
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

  getRazas(id: string) {
    const post = { p_especieid: id };

    this.veterinariaService.getRazas(post).subscribe({
      next: (res) => {
        this.dataRazas.set(res);
      },
      error: (error) => {
        console.error('error: ', error);
      }
    });
  }

  onEspecieChange(especieId: string) {
    this.getRazas(especieId);
  }

  changeTipoDocumento(value: string) {
    this.tipoDocumento.set(value);

    this.userFormGroup.patchValue({
      numdoc: '',
      nombres: '',
      apellidos: '',
      direccion: '',
    });

    if (value !== 'D') {
      this.userFormGroup.get('direccion')?.enable();
    } else {
      this.userFormGroup.get('direccion')?.disable();
    }

    console.log('value?', value);

    // this.resetFields();
  }

  searchPersona(numdoc: string) {
    const tipDoc = this.userFormGroup.get('tipdoc')?.value;

    if ((tipDoc === 'D' && numdoc.length === 8)) {
      this.getReniec(numdoc);
    } else if ((tipDoc === 'D' && numdoc.length > 5 && numdoc.length < 8)) {
      this.sweetAlertService.info('Opps!', 'El documento debe tener 8 digitos')
    } else {
      console.warn('Documento Invalido');
    }
    if ((tipDoc === 'E' && numdoc.length === 9)) {
      this.getCExtranjeria(numdoc);
    } else if ((tipDoc === 'E' && numdoc.length > 5 && numdoc.length < 9)) {
      this.sweetAlertService.info('Opps!', 'El documento debe tener 9 digitos')
    } else {
      console.warn('Documento Invalido');
    }
  }

  // getServicios() {
  //   const post = {}
  //   this.veterinariaService.getServicios(post).subscribe({
  //     next: (res) => {
  //       console.log('res: ', res);
  //       this.dataServicios.set(res);
  //     },
  //     error: (error) => {
  //       console.log('error: ', error);
  //     }
  //   })
  // }

  getReniec(query: string) {
    const post = {
      nuDniConsulta: query
    };

    this.veterinariaService.getReniec(post).subscribe({
      next: (res) => {
        const result = res.consultarResponse.return;
        const codeResult: string = result.coResultado;
        const message: string = result.deResultado;

        switch (codeResult) {
          case '0000':
            const persona = result.datosPersona;

            this.dataReniec.set(persona);

            const apellidos = `${persona.apPrimer ?? ''} ${persona.apSegundo ?? ''}`.trim();

            this.userFormGroup.patchValue({
              nombres: persona.prenombres ?? '',
              apellidos: apellidos,
              direccion: persona.direccion ?? '',
            });

            this.userFormGroup.get('nombres')?.disable();
            this.userFormGroup.get('apellidos')?.disable();

            this.sweetAlertService.success('', message);
            break;

          default:
            this.dataReniec.set(null);
            this.userFormGroup.patchValue({
              direccion: '',
              apellidos: '',
              nombres: '',
              dni: ''
            });
            this.sweetAlertService.error('ERROR', message);
            break;
        }
      },
      error: (error) => {
        console.error('Error en la petición:', error);
        this.userFormGroup.patchValue({
          direccion: '',
          apellidos: '',
          nombres: '',
          dni: ''
        });
      }
    });
  }

  getCExtranjeria(query: string) {
    const post = {
      docconsulta: query
    }
    if (query.length === 9) {
      this.veterinariaService.getCarnetExtranjeria(post).subscribe({
        next: (res) => {
          const codigo = res.codRespuesta;
          const message = res.desRespuesta;

          if (codigo !== '0000') {
            this.sweetAlertService.error('ERROR', message);
            this.userFormGroup.patchValue({
              direccion: '',
              apellidos: '',
              nombres: '',
              dni: ''
            });
          } else {
            const data = res.datosPersonales
            const apellidos = `${data.apepaterno ?? ''} ${data.apematerno ?? ''}`.trim();

            this.dataExtranjeria.set(data);

            this.userFormGroup.patchValue({
              nombres: data.nombres ?? '',
              apellidos: apellidos,
              direccion: data.direccion ?? '',
            });

            this.sweetAlertService.success('', message);
          }


        },
        error: (error) => {
          console.log('error: ', error);
          this.dataExtranjeria.set(null);
          this.sweetAlertService.error('ERROR', error);
        }
      })
    } else {
      this.sweetAlertService.info('', 'Por favor ingresar minimo 9 caracteres');
    }
  }


}
