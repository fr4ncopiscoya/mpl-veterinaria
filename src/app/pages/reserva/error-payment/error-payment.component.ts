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

    const day = Number(dateStr.substring(0, 2));
    const month = Number(dateStr.substring(2, 4)) - 1;
    const year = Number(dateStr.substring(4, 8));
    const hour = Number(dateStr.substring(8, 10));
    const minute = Number(dateStr.substring(10, 12));

    const date = new Date(year, month, day, hour, minute);

    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
