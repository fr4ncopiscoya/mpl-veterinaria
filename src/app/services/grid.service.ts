// src/app/services/grid.service.ts
import { Injectable } from '@angular/core';
import { Grid } from 'gridjs';

@Injectable({
    providedIn: 'root'
})
export class GridService {
    private instances = new Map<string, Grid>(); // múltiples grids por id opcional

    render(containerId: string, columns: any[], data: any[][], limit: number) {
        const container = document.getElementById(containerId);

        if (!container) return;

        if (this.instances.has(containerId)) {
            this.instances.get(containerId)!.destroy();
            this.instances.delete(containerId);
        }

        container.innerHTML = '';


        const grid = new Grid({
            columns,
            data,
            search: true,
            pagination: {
                limit: limit,
                summary: true
            },
            language: {
                search: { placeholder: 'Buscar...' },
                pagination: {
                    previous: 'Anterior',
                    next: 'Siguiente',
                    showing: 'Mostrando',
                    to: 'de',
                    of: 'de',
                    results: () => 'resultados'
                },
                noRecordsFound: 'No se encontraron resultados',
                error: 'Ocurrió un error al obtener datos',
            },
        });

        grid.render(container);
        this.instances.set(containerId, grid);
    }

    destroy(containerId: string) {
        if (this.instances.has(containerId)) {
            this.instances.get(containerId)!.destroy();
            this.instances.delete(containerId);
        }
    }
}
