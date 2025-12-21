import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryEquipmentORvehiclesComponent } from './inquiry-equipment-orvehicles.component';

describe('InquiryEquipmentORvehiclesComponent', () => {
  let component: InquiryEquipmentORvehiclesComponent;
  let fixture: ComponentFixture<InquiryEquipmentORvehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryEquipmentORvehiclesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiryEquipmentORvehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
