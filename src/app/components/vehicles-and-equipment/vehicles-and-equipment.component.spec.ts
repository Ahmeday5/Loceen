import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclesAndEquipmentComponent } from './vehicles-and-equipment.component';

describe('VehiclesAndEquipmentComponent', () => {
  let component: VehiclesAndEquipmentComponent;
  let fixture: ComponentFixture<VehiclesAndEquipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclesAndEquipmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiclesAndEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
