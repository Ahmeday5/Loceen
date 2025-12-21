import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquireEmployeeAccountsComponent } from './inquire-employee-accounts.component';

describe('InquireEmployeeAccountsComponent', () => {
  let component: InquireEmployeeAccountsComponent;
  let fixture: ComponentFixture<InquireEmployeeAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquireEmployeeAccountsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquireEmployeeAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
