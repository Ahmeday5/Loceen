import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryPercentageSystemComponent } from './inquiry-percentage-system.component';

describe('InquiryPercentageSystemComponent', () => {
  let component: InquiryPercentageSystemComponent;
  let fixture: ComponentFixture<InquiryPercentageSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryPercentageSystemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiryPercentageSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
