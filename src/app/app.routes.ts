import { Routes } from '@angular/router';
import InicioComponent from './pages/inicio/inicio.component';

export const routes: Routes = [
    {
        path: 'veterinaria',
        loadComponent: () => import('./pages/templates/hero/hero.component'),
        children: [
            {
                path: 'inicio',
                loadComponent: () => import('./pages/inicio/inicio.component'),
                // loadComponent: () => import('./pages/reserva/success-payment/success-payment.component'),
            },
            {
                path: 'reserva',
                loadComponent: () => import('./pages/reserva/reserva.component'),
            },
            {
                path: '**',
                redirectTo: 'inicio'
            }
        ]
    },
    {
        path: 'success-payment/:purchaseNumber',
        loadComponent: () => import('./pages/reserva/success-payment/success-payment.component'),
    },
    {
        path: 'error-payment/:purchaseNumber',
        loadComponent: () => import('./pages/reserva/error-payment/error-payment.component'),
    },
    {
        path: 'admin',
        loadComponent: () => import('./pages/templates/admin/admin.component'),
        children: [
            {
                path: 'inicio',
                loadComponent: () => import('./pages/dashboard/dashboard.component'),
            },
            {
                path: 'historial',
                loadComponent: () => import('./pages/admin/reserva-historial/reserva-historial.component'),
                data: { title: 'HISTORIAL DE RESERVAS' }
            },
            {
                path: '**',
                redirectTo: 'inicio'
            },
            {
                path: '',
                redirectTo: 'inicio',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: 'veterinaria',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'veterinaria'
    }
];
