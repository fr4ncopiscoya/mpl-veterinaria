import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-payment',
  imports: [RouterLink],
  templateUrl: './error-payment.component.html',
  // styleUrl: './error-payment.component.css'
})
export default class ErrorPaymentComponent {

  paymentData: any;
  purchaseNumber: any;

  formatDate(dateStr: string): string {
    if (!dateStr || dateStr.length !== 12) return dateStr;

    const year = 2000 + Number(dateStr.substring(0, 2)); // yy → yyyy
    const month = Number(dateStr.substring(2, 4)) - 1;   // MM
    const day = Number(dateStr.substring(4, 6));         // dd
    const hour = Number(dateStr.substring(6, 8));        // HH
    const minute = Number(dateStr.substring(8, 10));     // mm
    const second = Number(dateStr.substring(10, 12));    // ss

    const date = new Date(year, month, day, hour, minute, second);

    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }




  ngOnInit() {
    const queryParams = new URLSearchParams(window.location.search);
    const encoded = queryParams.get('data');
    this.purchaseNumber = queryParams.get('purchaseNumber');

    if (encoded) {
      this.paymentData = JSON.parse(atob(decodeURIComponent(encoded)));
    }
  }

}
