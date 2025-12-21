import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingExpensesComponent } from './recording-expenses.component';

describe('RecordingExpensesComponent', () => {
  let component: RecordingExpensesComponent;
  let fixture: ComponentFixture<RecordingExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordingExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordingExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
