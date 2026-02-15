import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentDataComponent } from './equipment-data.component';

describe('EquipmentDataComponent', () => {
  let component: EquipmentDataComponent;
  let fixture: ComponentFixture<EquipmentDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
