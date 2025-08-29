import { Routes } from '@angular/router';
import InicioComponent from './pages/inicio/inicio.component';
import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'success-payment/:purchaseNumber',
        loadComponent: () => import('./pages/reserva/success-payment/success-payment.component'),
    },
    {
        path: 'error-payment/:purchaseNumber',
        loadComponent: () => import('./pages/reserva/error-payment/error-payment.component'),
    },
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
                path: 'terminos',
                loadComponent: () => import('./pages/reserva/terminos-condiciones/terminos-condiciones.component'),
            },
            {
                path: '**',
                redirectTo: 'inicio'
            }
        ]
    },
    {
        path: 'admin',
        loadComponent: () => import('./pages/templates/admin/admin.component'),
        canActivate: [AuthGuard], // Solo si está logeado
        children: [
            // {
            //     path: 'inicio',
            //     loadComponent: () => import('./pages/dashboard/dashboard.component'),
            // },
            {
                path: 'historial',
                loadComponent: () => import('./pages/admin/reserva-historial/reserva-historial.component'),
                data: { title: 'HISTORIAL DE RESERVAS' }
            },
            {
                path: '', redirectTo: 'historial',
                pathMatch: 'full'
            },
            {
                path: '**',
                redirectTo: 'historial'
            }
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component'),
        canActivate: [LoginGuard] // Si ya está logeado, lo redirige
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
