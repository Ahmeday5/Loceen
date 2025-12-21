import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryAboutEmployeeEccountsComponent } from './inquiry-about-employee-eccounts.component';

describe('InquiryAboutEmployeeEccountsComponent', () => {
  let component: InquiryAboutEmployeeEccountsComponent;
  let fixture: ComponentFixture<InquiryAboutEmployeeEccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryAboutEmployeeEccountsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiryAboutEmployeeEccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
