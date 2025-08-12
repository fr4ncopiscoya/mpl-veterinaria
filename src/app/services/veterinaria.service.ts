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


  // ===== IDENTIFICACIÓN =====
  getReniec(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-reniec`, data);
  }

  getCarnetExtranjeria(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-cextranjeria`, data);
  }

  getFechasDisponibles(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-fechas`, data);
  }
  getHorariosDisponibles(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-horarios`, data);
  }
  getServiciosDisponibles(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-servicios`, data);
  }
  getRazas(data: any): Observable<any> {
    return this.http.post(`${environment.apiBackend}/veterinaria/sel-razas`, data);
  }
  // getServicios(data: any): Observable<any> {
  //   return this.http.post(`${environment.apiBackend}/veterinaria/sel-servicios`, data);
  // }
}
