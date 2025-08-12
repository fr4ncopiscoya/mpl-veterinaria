import { Routes } from '@angular/router';
import InicioComponent from './pages/inicio/inicio.component';

export const routes: Routes = [
    {
        path: 'veterinaria',
        loadComponent: () => import('./pages/template-hero/template-hero.component'),
        children: [
            {
                path: 'inicio',
                loadComponent: () => import('./pages/inicio/inicio.component'),
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
        path: '',
        redirectTo: 'veterinaria',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'veterinaria'
    }
];
