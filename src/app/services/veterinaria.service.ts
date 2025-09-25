import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class VeterinariaService {

  private http = inject(HttpClient);

  constructor() { }


  loginAuth(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/auth-login`, data);
  }

  // ===== IDENTIFICACIÓN =====
  getReniec(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-reniec`, data);
  }
  getCarnetExtranjeria(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-cextranjeria`, data);
  }

  // ===== FECHAS, HORARIOS Y SERVICIOS DISPONIBLES
  getFechasDisponibles(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-fechas`, data);
  }
  getHorariosDisponibles(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-horarios`, data);
  }
  getServiciosDisponibles(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-servicios`, data);
  }

  // ===========
  getRazas(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-razas`, data);
  }

  getReservaCita(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-reserva`, data);
  }
  insReservarCita(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/ins-reserva`, data);
  }
  insExtraPayment(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/ins-extrapay`, data);
  }
  updReservarCita(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/upd-reserva`, data);
  }
  updReservaEstado(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/upd-reservaestado`, data);
  }
  updLiquidacionPago(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/upd-liquidacionpago`, data);
  }
  getServicios(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-allservicios`, data);
  }
  getEstadoReserva(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-estadoreserva`, data);
  }

  // BLOQUEAR HORARIOS, FECHAS y ASIGNAR CAMPAÑAS
  insBloquearFechas(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/ins-bloqfecha`, data);
  };
  insBloquearHorarios(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/ins-bloqhorario`, data);
  }
  insCampanias(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/ins-campania`, data);
  }
}
