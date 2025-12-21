import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryEquipmentComponent } from './inquiry-equipment.component';

describe('InquiryEquipmentComponent', () => {
  let component: InquiryEquipmentComponent;
  let fixture: ComponentFixture<InquiryEquipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryEquipmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiryEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
