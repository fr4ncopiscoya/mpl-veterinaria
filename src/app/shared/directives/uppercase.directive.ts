import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]'
})
export class UppercaseDirective {
  constructor(private el: ElementRef<HTMLInputElement>, private control: NgControl) { }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    const upperValue = input.value.toUpperCase();
    input.value = upperValue;

    // Actualiza el valor en el FormControl si existe
    if (this.control && this.control.control) {
      this.control.control.setValue(upperValue, { emitEvent: false });
    }
  }
}
