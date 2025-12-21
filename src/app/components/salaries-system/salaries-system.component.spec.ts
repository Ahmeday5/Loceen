import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalariesSystemComponent } from './salaries-system.component';

describe('SalariesSystemComponent', () => {
  let component: SalariesSystemComponent;
  let fixture: ComponentFixture<SalariesSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalariesSystemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalariesSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
