import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryEmployeesComponent } from './inquiry-employees.component';

describe('InquiryEmployeesComponent', () => {
  let component: InquiryEmployeesComponent;
  let fixture: ComponentFixture<InquiryEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiryEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
