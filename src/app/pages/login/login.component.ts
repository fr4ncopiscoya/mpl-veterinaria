import { Component, inject, signal, ViewChild } from '@angular/core';
import { ToastComponent } from '../../components/toast/toast.component';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { VeterinariaService } from '../../services/veterinaria.service';
import { UppercaseDirective } from "../../shared/directives/uppercase.directive";
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ToastComponent],
  templateUrl: './login.component.html',
})
export default class LoginComponent {

  constructor(private route: Router) {
  }
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  private veterinariaService = inject(VeterinariaService);
  private session = inject(SessionService);
  private authService = inject(AuthService);

  USERNAME = signal<string>('');

  togglePassword() {
    let passwordInput = document.getElementById('password-input') as HTMLInputElement;
    let passwordIcon = document.getElementById('passwordEye') as HTMLSpanElement;

    if (passwordIcon.classList.contains('ri-eye-fill')) {
      passwordInput.type = 'text';
      passwordIcon.classList.remove('ri-eye-fill');
      passwordIcon.classList.add('ri-eye-off-fill');
    } else {
      passwordInput.type = 'password';
      passwordIcon.classList.remove('ri-eye-off-fill');
      passwordIcon.classList.add('ri-eye-fill');
    }
  }

  login(username: string, password: string) {
    let btnLogin = document.getElementById('btnLoginAction') as HTMLButtonElement;
    btnLogin.innerHTML = '<span class="align-items-center"><span class="spinner-border flex-shrink-0" role="status"><span class="visually-hidden">Loading...</span></span><span class="flex-grow-1 ms-2">Ingresando...</span></span>';
    btnLogin.classList.add('pe-none', 'btn-load');

    const post = {
      p_loging: username,
      p_passwd: password
    };

    this.veterinariaService.loginAuth(post).subscribe({
      next: (res: any) => {
        const status = res.success;
        const message = res.mensaje;

        switch (status) {
          case true:
            this.toastComponent.showToast('Inicio de sesión correcto', 'success');
            console.log('res? ', res);
            
            // Guardar en localStorage que está logueado
            // localStorage.setItem('session-logged', 'true'); //con esto valida permiso de ruta
            // localStorage.setItem('user-data', JSON.stringify(res.user));

            this.authService.login('true',res.user);

            setTimeout(() => {
              this.route.navigate(['/admin']);
            }, 2000);
            break;
          case false:
            this.toastComponent.showToast(message, '');
            break;
          default:
            break;
        }

        // if (code === 0) {
        // } else {
        //   this.toastComponent.showToast('Acceso denegado al dashboard.', 'danger');
        // }

        btnLogin.innerHTML = 'Ingresar';
        btnLogin.classList.remove('pe-none', 'btn-load');
      },
      error: (error) => {
        console.log('Error en la petición', error);
        btnLogin.innerHTML = 'Ingresar';
        btnLogin.classList.remove('pe-none', 'btn-load');
        this.toastComponent.showToast('Error al iniciar sesión, intentelo nuevamente.', 'danger');
      }
    })
  }

}
