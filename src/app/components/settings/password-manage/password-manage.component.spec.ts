import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordManageComponent } from './password-manage.component';

describe('PasswordManageComponent', () => {
  let component: PasswordManageComponent;
  let fixture: ComponentFixture<PasswordManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
