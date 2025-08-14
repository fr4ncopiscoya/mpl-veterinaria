import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaHorariosComponent } from './reserva-horarios.component';

describe('ReservaHorariosComponent', () => {
  let component: ReservaHorariosComponent;
  let fixture: ComponentFixture<ReservaHorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaHorariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
