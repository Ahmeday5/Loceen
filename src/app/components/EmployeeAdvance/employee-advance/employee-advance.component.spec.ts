import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAdvanceComponent } from './employee-advance.component';

describe('EmployeeAdvanceComponent', () => {
  let component: EmployeeAdvanceComponent;
  let fixture: ComponentFixture<EmployeeAdvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAdvanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
