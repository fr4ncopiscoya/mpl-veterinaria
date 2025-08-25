import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
declare var bootstrap: any;

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
})


export class ModalComponent implements AfterViewInit {

  @Input() title: string = 'Modal';
  @Input() size: 'modal-sm' | 'modal-lg' | 'modal-xl' | '' = '';
  @Input() bgcolor: 'bg-warning' | 'bg-primary' | 'bg-secondary' | '' = '';

  @ViewChild('modalRef') modalElement!: ElementRef;

  private modalInstance: any;

  ngAfterViewInit() {
    this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement, {
      backdrop: 'static', // evita cierre al hacer clic fuera
      keyboard: false      // evita cierre con tecla ESC
    });
  }

  open() {
    this.modalInstance?.show();
  }

  close() {
    this.modalInstance?.hide();
  }
}
