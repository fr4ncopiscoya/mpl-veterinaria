import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  // Alerta genérica personalizada
  fire(options: SweetAlertOptions) {
    return Swal.fire(options);
  }

  // Confirmación reutilizable
  confirm(
    title: string = '¿Estás seguro?',
    text: string = '',
    icon: SweetAlertIcon = 'warning',
    confirmButtonText: string = 'Sí',
    cancelButtonText: string = 'Cancelar'
  ) {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText
    });
  }

  // Éxito rápido
  success(title: string, text: string = '') {
    return Swal.fire({
      icon: 'success',
      title,
      text
    });
  }

  // Error rápido
  error(title: string, text: string = '') {
    return Swal.fire({
      icon: 'error',
      title,
      text
    });
  }

  // Info rápida
  info(title: string, text: string = '') {
    return Swal.fire({
      icon: 'info',
      title,
      text
    });
  }

  // Loading con cierre manual
  loading(text: string = 'Cargando...') {
    Swal.fire({
      title: text,
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      backdrop: true,
    });
  }

  close() {
    Swal.close();
  }
}
