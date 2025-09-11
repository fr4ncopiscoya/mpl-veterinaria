import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaFechasComponent } from './reserva-fechas.component';

describe('ReservaFechasComponent', () => {
  let component: ReservaFechasComponent;
  let fixture: ComponentFixture<ReservaFechasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaFechasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaFechasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
