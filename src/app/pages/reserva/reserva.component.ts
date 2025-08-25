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
import { IpService } from '../../services/ip-service.service';
import { Router } from '@angular/router';
import { UppercaseDirective } from '../../shared/directives/uppercase.directive';
import { interval, Subscription } from 'rxjs';

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
    DatePipe,
    UppercaseDirective
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
  private ipService = inject(IpService);
  private router = inject(Router);

  private merchantDEV = '456879852'
  private merchantPRD = '651043487'

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
  ipAddress: string = '';
  urlAddress: string = '';

  contadorSub!: Subscription;
  minutos: number = 0;
  segundos: number = 0;

  //   reservaAmount: number = 50.00; // Monto valor de la reserva
  // isReadyToPay: boolean = false; // Esto se activa cuando ya estas ready para pagar
  // purchaseNumber: string = '123456'

  constructor(private fb: FormBuilder, private paymentService: PaymentService) {
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
      direccion: ['', Validators.required],
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
    this.getIp();
  }

  filterDates = (date: Date | null): boolean => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return this.dataFechasDisponibles().includes(dateStr);
  };

  getIp() {
    this.ipService.getPublicIp().subscribe((res: any) => {
      this.ipAddress = res.ip;
      const originalUrl = document.location.href;
      this.urlAddress = btoa(originalUrl);
    });
  }

  iniciarContador(minutos: number) {
    // Ajustamos para que arranque en el minuto completo
    this.minutos = minutos - 1;
    this.segundos = 59;

    // Si ya existe un contador, lo limpiamos para evitar duplicados
    if (this.contadorSub) {
      this.contadorSub.unsubscribe();
    }

    this.contadorSub = interval(1000).subscribe(() => {
      if (this.segundos > 0) {
        this.segundos--;
      } else {
        if (this.minutos > 0) {
          this.minutos--;
          this.segundos = 59;
        } else {
          // Tiempo expiró
          this.contadorSub.unsubscribe();

          // Acción al expirar: redirigir o recargar
          alert('Tiempo de pago expirado. El horario se liberó.');

          // Opción 1: recargar la página
          window.location.reload();

          // Opción 2: redirigir a otra ruta en Angular
          // this.router.navigate(['/horarios']);
        }
      }
    });
  }

  ngOnDestroy() {
    // Evitar fugas de memoria
    if (this.contadorSub) {
      this.contadorSub.unsubscribe();
    }
  }

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

    console.log('purcharseNumber: ', this.purchaseNumber);
    console.log('reservaAmount: ', this.reservaAmount);
    

    if (this.purchaseNumber !== '' && this.reservaAmount > 0.1) {
      this.openPaymentForm();
    } else {
      this.veterinariaService.insReservarCita(post).subscribe({
        next: (res) => {
          console.log('res: ', res[0]);

          if (res[0].estado == "error") {
            this.sweetAlertService.error('', res[0].mensaje);
            this.purchaseNumber = '';
            this.reservaAmount = 0.00
            return
          } else {

            this.purchaseNumber = res[0].numero_liquidacion;
            this.reservaAmount = res[0].monto_a_pagar;

            // 🔹 Tomar minutos de bloqueo
            const minutosBloqueo = res[0].minutos_bloqueo || 5; // fallback 5 minutos
            this.iniciarContador(minutosBloqueo);

            // 🔹 Abrir pasarela de pago
            this.openPaymentForm();
          }

        },
        error: (error) => {
          console.error('Error al crear reserva: ', error);
          this.sweetAlertService.error('', error)
        }
      });
    }

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

    // if (value != 1) {
    //   this.userFormGroup.get('direccion')?.enable();
    // } else {
    //   this.userFormGroup.get('direccion')?.disable();
    // }

    // this.resetFields();
  }

  searchPersona(numdoc: string) {
    const tipDoc = this.userFormGroup.get('tipdoc')?.value;

    const nombres = this.userFormGroup.get('nombres')?.value;
    console.log('nombres: ', nombres);


    if (nombres === '') {
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
    } else {
      console.log('ya consultaste oe XD');

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

  // Cambios Horny

  private configureNiubiz(sessionToken: string): void {
    VisanetCheckout.configure({
      // action: 'https:///127.0.0.1:8000/niubiz/process-payment/' + this.purchaseNumber + '/' + this.reservaAmount + '/' + this.urlAddress,
      action: 'https://appsapi.muniplibre.gob.pe/niubiz/process-payment/' + this.purchaseNumber + '/' + this.reservaAmount + '/' + this.urlAddress,
      method: 'POST',
      sessiontoken: sessionToken,
      channel: 'web',
      merchantid: this.merchantPRD,
      purchasenumber: this.purchaseNumber,
      amount: this.reservaAmount,
      expirationminutes: '10',
      timeouturl: 'https://apps.muniplibre.gob.pe/veterinaria/veterinaria/reserva',
      merchantlogo: 'https://apps.muniplibre.gob.pe/assets/images/logo-large.png',
      merchantname: 'Municipalidad de Pueblo Libre',
      formbuttoncolor: '#000000',
      additionalData: {
        purchaseNumber: this.purchaseNumber,
        amount: this.reservaAmount,
        urlAddress: encodeURIComponent(this.urlAddress)
      },
      onsuccess: this.handleSuccess.bind(this),
      onerror: (error: any) => {
        console.error('Error en el checkout de Niubiz:', error);
        alert('Ocurrió un error con el pago. Por favor, revisa tus datos.');
      },
    });
  }

  paymentProcessInit() {
    this.paymentService.getSessionToken(this.reservaAmount, this.userFormGroup.get('correo')?.value, this.userFormGroup.get('telefono')?.value, this.ipAddress).subscribe({
      next: (response) => {
        console.log('PASO 1: OBTENGO TOKEN DE SESION:', response);
        this.configureNiubiz(response.sessionToken);
        this.isReadyToPay = true;
        console.log('Token de sesión obtenido y Niubiz configurado.');
        setTimeout(() => {
          VisanetCheckout.open();
        }, 100);
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
      amount: this.reservaAmount,
      ipAddress: this.ipAddress,
      urlAddress: this.urlAddress
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
