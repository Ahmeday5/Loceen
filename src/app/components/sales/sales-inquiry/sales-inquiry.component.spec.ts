import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesInquiryComponent } from './sales-inquiry.component';

describe('SalesInquiryComponent', () => {
  let component: SalesInquiryComponent;
  let fixture: ComponentFixture<SalesInquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesInquiryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
