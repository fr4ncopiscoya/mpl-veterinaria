import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos una interfaz para la carga útil del pago final para mayor claridad
export interface PaymentPayload {
  transactionToken: string;
  purchaseNumber: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // Las URLs de tu API de Laravel
  private apiUrl = 'http://127.0.0.1:8000/niubiz'; // URL base
  // private apiUrl = 'http://localhost:4200/niubiz'; // URL base

  constructor(private http: HttpClient) { }

  /**
   * Solicita el token de sesión al backend de Laravel.
   * @param amount El monto total de la transacción.
   * @returns Un Observable con el token de sesión.
   */
  getSessionToken(amount: number, email: string, phone: string): Observable<{ sessionToken: string }> {
    return this.http.post<{ sessionToken: string }>(`${this.apiUrl}/session-token`, { amount, email, phone });
  }

  /**
   * Envía el token de transacción al backend para procesar el pago final.
   * @param payload Los datos necesarios para el pago final.
   * @returns Un Observable con la respuesta del backend.
   */
  processFinalPayment(payload: PaymentPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/process-payment`, payload);
  }
}