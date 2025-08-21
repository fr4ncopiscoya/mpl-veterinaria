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
import { PaymentService, PaymentPayload } from '../../services/payment.service';
import { Router } from '@angular/router';

declare const VisanetCheckout: any;

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
  private router = inject(Router);

  dataReniec = signal<DatosPersona | null>(null);
  dataExtranjeria = signal<DatosPersonaExtranjera | null>(null);
  dataServicios = signal<DataServicios[]>([]);
  dataFechasDisponibles = signal<string[]>([]);
  dataHorarios = signal<string[]>([]);
  dataRazas = signal<any>('');
  // dataRazas = signal<string[]>([]);

  tipoDocumento = signal<number>(1);


  dateFormGroup: FormGroup;
  userFormGroup: FormGroup;
  petFormGroup: FormGroup;

  availableTimeSlots: string[] = [];

  // Variables Horny
  reservaAmount: number = 0.00; // Monto valor de la reserva
  isReadyToPay: boolean = false; // Esto se activa cuando ya estas ready para pagar
  purchaseNumber: string = ''; // Aqui pones el ID de la Reserva  

  //   reservaAmount: number = 50.00; // Monto valor de la reserva
  // isReadyToPay: boolean = false; // Esto se activa cuando ya estas ready para pagar
  // purchaseNumber: string = '123456'


  //Data Response Success-payment
  purcharseNumber = signal<string>('');
  transactionDate = signal<string>('');
  amount = signal<string>('');
  currency = signal<string>('');
  card = signal<string>('');
  brand = signal<string>('');

  constructor(private fb: FormBuilder, private paymentService: PaymentService) {
    this.dateFormGroup = this.fb.group({
      date: [null, Validators.required],
      time: [null, Validators.required],
      servicio: [null, Validators.required],
    });

    this.userFormGroup = this.fb.group({
      tipdoc: ['', Validators.required],
      numdoc: ['', Validators.required],
      nombres: [{ value: '', disabled: false }, Validators.required],
      apellidos: [{ value: '', disabled: false }, Validators.required],
      direccion: [{ value: '', disabled: false }, Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.minLength(9), Validators.required]],
    });

    this.userFormGroup.get('tipdoc')?.valueChanges.subscribe((tipo: number) => {
      this.changeTipoDocumento(tipo);
    });

    this.petFormGroup = this.fb.group({
      nombre: ['', Validators.required],
      especie: ['', Validators.required],
      raza: ['', Validators.required],
      // motivo: ['', Validators.required]
    });

    this.dateFormGroup.get('date')?.valueChanges.subscribe((date: Date) => {
      const formatted = date.toISOString().split('T')[0];

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

  saveReservaCita() {
    const rawUser = this.userFormGroup.getRawValue();
    const rawPet = this.petFormGroup.getRawValue();
    const rawDate = this.dateFormGroup.getRawValue();

    const post = {
      tipdoc_id: rawUser.tipdoc,
      persona_numdoc: rawUser.numdoc,
      persona_nombre: rawUser.nombres,
      persona_apepaterno: rawUser.apellidos?.split(' ')[0] || '',
      persona_apematerno: rawUser.apellidos?.split(' ')[1] || '',
      cliente_direccion: rawUser.direccion,
      cliente_correo: rawUser.correo,
      cliente_telefono: rawUser.telefono,
      mascota_nombre: rawPet.nombre,
      especie_id: rawPet.especie,
      raza_id: rawPet.raza,
      servicio_id: rawDate.servicio,
      fecha_cita: this.formatFecha(rawDate.date),
      hora_cita: rawDate.time,
      estado_id: 1,
      observaciones: 'Observaciones aquí'
    };

    this.veterinariaService.postReservarCita(post).subscribe({
      next: (res) => {
        this.purchaseNumber = res[0].numero_liquidacion;
        this.reservaAmount = res[0].monto_a_pagar;
        this.openPaymentForm();
      },
      error: (error) => {
        console.error('Error al crear reserva: ', error);
        this.sweetAlertService.error('', error)
      }
    });
  }

  private formatFecha(fecha: Date): string {
    if (!fecha) return '';
    return fecha.toISOString().split('T')[0];
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  changeTipoDocumento(value: number) {
    this.tipoDocumento.set(value);

    this.userFormGroup.patchValue({
      numdoc: '',
      nombres: '',
      apellidos: '',
      direccion: '',
    });

    if (value != 1) {
      this.userFormGroup.get('direccion')?.enable();
    } else {
      this.userFormGroup.get('direccion')?.disable();
    }

    console.log('value?', value);

    // this.resetFields();
  }

  searchPersona(numdoc: string) {
    const tipDoc = this.userFormGroup.get('tipdoc')?.value;

    if ((tipDoc == 1 && numdoc.length === 8)) {
      this.getReniec(numdoc);
    } else if ((tipDoc == 1 && numdoc.length > 5 && numdoc.length < 8)) {
      this.sweetAlertService.info('Opps!', 'El documento debe tener 8 digitos')
    } else {
      console.warn('Documento Invalido');
    }
    if ((tipDoc == 2 && numdoc.length === 9)) {
      this.getCExtranjeria(numdoc);
    } else if ((tipDoc == 2 && numdoc.length > 5 && numdoc.length < 9)) {
      this.sweetAlertService.info('Opps!', 'El documento debe tener 9 digitos')
    } else {
      console.warn('Documento Invalido');
    }
  }

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

  // updLiquidacionPago(){
  //   const post = {
  //     numero_liquidacion: this.purchaseNumber
  //   }

  //   this.veterinariaService.updLiquidacionPago(post).subscribe({
  //     next:(res)=>{
  //       console.log('response: ', res);
  //       window.location.href = '/success-payment/' + this.purchaseNumber;
  //     },
  //     error:(error)=>{
  //       console.log('error: ', error);

  //     }
  //   })
  // }

  // Cambios Horny

  private configureNiubiz(sessionToken: string): void {
    VisanetCheckout.configure({
      action: 'http://127.0.0.1:8000/niubiz/process-payment/' + this.purchaseNumber + '/' + this.reservaAmount,
      method: 'POST',
      sessiontoken: sessionToken,
      channel: 'web',
      merchantid: '456879852',
      purchasenumber: this.purchaseNumber,
      amount: this.reservaAmount,
      expirationminutes: '20',
      timeouturl: 'about:blank',
      merchantlogo: 'http://localhost:4200/assets/images/logo-large.png',
      merchantname: 'Municipalidad de Pueblo Libre',
      formbuttoncolor: '#000000',
      onsuccess: this.handleSuccess.bind(this),
      onerror: (error: any) => {
        console.error('Error en el checkout de Niubiz:', error);
        alert('Ocurrió un error con el pago. Por favor, revisa tus datos.');
      }
    });
  }

  paymentProcessInit() {
    this.paymentService.getSessionToken(this.reservaAmount, this.userFormGroup.get('correo')?.value, this.userFormGroup.get('telefono')?.value).subscribe({
      next: (response) => {
        console.log('PASO 1: OBTENGO TOKEN DE SESION:', response);
        this.configureNiubiz(response.sessionToken);
        this.isReadyToPay = true;
        console.log('Token de sesión obtenido y Niubiz configurado.');
        setTimeout(() => {
          VisanetCheckout.open();
        }, 500);
      },
      error: (err) => {
        console.error('Error al obtener el token de sesión', err);
        alert('No se pudo iniciar el proceso de pago. Por favor, recarga la página.');
      }
    });
  }

  openPaymentForm(): void {
    this.paymentProcessInit();
  }

  private handleSuccess(data: any): void {
    console.log('PASO 2: ENVIO INFORMACION DE PAGO AL BACKEND PARA AUTORIZACION:', data);

    const payload: PaymentPayload = {
      transactionToken: data.transactionToken,
      purchaseNumber: this.purchaseNumber,
      amount: this.reservaAmount
    };

    this.paymentService.processFinalPayment(payload).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('¡Pago exitoso!', response);
          // this.purcharseNumber.set(response.data?.order?.purchaseNumber);
          // this.transactionDate.set(response.data?.order?.purchaseNumber);
          // this.amount.set(response.data?.order?.amount);
          // this.currency.set(response.data?.order?.currency);
          // this.card.set(response.data?.dataMap?.CARD);
          // this.brand.set(response.data?.dataMap?.BRAND);

          // this.paymentService.setPaymentData(response.data);
          // this.router.navigate(['/success-payment', this.purchaseNumber]);

          // this.updLiquidacionPago();
        } else {
          console.error('El pago falló en el backend', response);
          this.sweetAlertService.error('', 'El pago no pudo ser procesado por el banco. Intenta con otra tarjeta.')
        }
      },
      error: (err) => {
        console.error('Error de comunicación al procesar el pago final', err);
        this.sweetAlertService.error('', err)
      }
    });
  }
}
