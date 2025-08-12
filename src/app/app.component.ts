import { Component } from '@angular/core';
import { SpinnerService } from './services/spinner.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  loading = false;

  constructor(private spinnerService: SpinnerService, private router: Router) { }

  ngOnInit(): void {
    this.spinnerService.loading$.subscribe(value => {
      this.loading = value;
    });

    this.router.events.subscribe(event => {
      // if (event instanceof NavigationStart) {
      //   this.spinnerService.show();
      //   setTimeout(() => {
      //     this.spinnerService.hide();
      //   }, 2500);
      // }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        // Si quieres que termine apenas cargue, puedes quitar el setTimeout de arriba y solo dejar esto
        this.spinnerService.hide();
      }
    });
  }
}
