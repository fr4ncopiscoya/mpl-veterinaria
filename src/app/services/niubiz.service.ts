import { Injectable } from '@angular/core';
import { PaymentService, PaymentPayload } from './payment.service';
import { SweetAlertService } from './sweet-alert.service';
import { IpService } from './ip-service.service';

declare var VisanetCheckout: any;

@Injectable({
    providedIn: 'root'
})
export class NiubizService {

    private merchantDEV = '456879852';
    private merchantPRD = '651043487';

    // private endpoint = 'http://127.0.0.1:8000/niubiz';
    private endpoint = 'https://appsapi.muniplibre.gob.pe/niubiz'

    private ipAddress!: string;
    private urlAddress!: string;

    constructor(
        private paymentService: PaymentService,
        private sweetAlert: SweetAlertService,
        private ipService: IpService
    ) { }

    /**
     * Obtiene IP pública y URL codificada antes de iniciar el pago
     */
    private initContext(): Promise<{ ipAddress: string, urlAddress: string }> {
        return new Promise((resolve, reject) => {
            this.ipService.getPublicIp().subscribe({
                next: (res: any) => {
                    this.ipAddress = res.ip;
                    this.urlAddress = btoa(document.location.href);
                    resolve({ ipAddress: this.ipAddress, urlAddress: this.urlAddress });
                },
                error: (err) => reject(err)
            });
        });
    }

    /**
     * Inicializa el proceso de pago completo
     */
    async initPayment(
        purchaseNumber: string,
        amount: number,
        email: string,
        phone: string,
        tipo: 'reserva' | 'extra' = 'reserva'   // 👈 parámetro opcional
    ) {
        try {
            // 1. Prepara IP + URL
            const { ipAddress, urlAddress } = await this.initContext();

            // 2. Obtiene token de sesión
            this.paymentService.getSessionToken(amount, email, phone, ipAddress).subscribe({
                next: (response) => {
                    console.log('PASO 1: TOKEN DE SESIÓN', response);

                    // Configura checkout según el tipo
                    this.configureNiubiz(
                        response.sessionToken,
                        purchaseNumber,
                        amount,
                        urlAddress,
                        ipAddress,
                        tipo
                    );

                    setTimeout(() => VisanetCheckout.open(), 100);
                },
                error: (err) => {
                    console.error('Error al obtener token', err);
                    this.sweetAlert.error('', 'No se pudo iniciar el pago.');
                }
            });
        } catch (err) {
            console.error('Error inicializando contexto de pago', err);
            this.sweetAlert.error('', 'Error obteniendo la IP del cliente.');
        }
    }

    private configureNiubiz(
        sessionToken: string,
        purchaseNumber: string,
        amount: number,
        urlAddress: string,
        ipAddress: string,
        tipo: 'reserva' | 'extra'
    ): void {
        const endpoint =
            tipo === 'extra'
                ? this.endpoint + '/process-payment-extra/'
                : this.endpoint + '/process-payment/';

        VisanetCheckout.configure({
            action: endpoint + purchaseNumber + '/' + amount + '/' + urlAddress,
            method: 'POST',
            sessiontoken: sessionToken,
            channel: 'web',
            merchantid: this.merchantPRD,
            purchasenumber: purchaseNumber,
            amount: amount,
            expirationminutes: '10',
            timeouturl: 'https://apps.muniplibre.gob.pe/veterinaria/veterinaria/reserva',
            merchantlogo: 'https://apps.muniplibre.gob.pe/assets/images/logo-large.png',
            merchantname: 'Municipalidad de Pueblo Libre',
            formbuttoncolor: '#000000',
            additionalData: { purchaseNumber, amount, urlAddress },
            onsuccess: (data: any) =>
                this.handleSuccess(data, purchaseNumber, amount, ipAddress, urlAddress, tipo),
            onerror: (error: any) => {
                console.error('Error en checkout Niubiz:', error);
                this.sweetAlert.error('', 'Ocurrió un error con el pago.');
            },
        });
    }

    private handleSuccess(
        data: any,
        purchaseNumber: string,
        amount: number,
        ipAddress: string,
        urlAddress: string,
        tipo: 'reserva' | 'extra'
    ): void {
        console.log('PASO 2: AUTORIZACIÓN AL BACKEND', data);

        const payload: PaymentPayload = {
            transactionToken: data.transactionToken,
            purchaseNumber,
            amount,
            ipAddress,
            urlAddress
        };

        this.paymentService.processFinalPayment(payload, tipo).subscribe({
            next: (response) => {
                if (response.success) {
                    this.sweetAlert.success('¡Pago realizado!', 'Se confirmó tu transacción.');
                } else {
                    this.sweetAlert.error('', 'El banco rechazó el pago.');
                }
            },
            error: (err) => {
                console.error('Error backend', err);
                this.sweetAlert.error('', 'No se pudo confirmar el pago.');
            }
        });
    }

}
