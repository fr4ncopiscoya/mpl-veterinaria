import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appOnlyNumbers]'
})
export class OnlyNumbersDirective {
  @Input() appOnlyNumbers: number | undefined; // longitud máxima opcional

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // ✅ Eliminar todo lo que no sea número
    value = value.replace(/\D/g, '');

    // ✅ Cortar a la longitud máxima si se definió
    if (this.appOnlyNumbers && value.length > this.appOnlyNumbers) {
      value = value.substring(0, this.appOnlyNumbers);
    }

    // ✅ Actualizar el valor del formulario
    this.ngControl.control?.setValue(value, { emitEvent: false });
  }
}
