import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaCampaniasComponent } from './reserva-campanias.component';

describe('ReservaCampaniasComponent', () => {
  let component: ReservaCampaniasComponent;
  let fixture: ComponentFixture<ReservaCampaniasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaCampaniasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaCampaniasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
