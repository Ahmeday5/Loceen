import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingWorkingComponent } from './recording-working.component';

describe('RecordingWorkingComponent', () => {
  let component: RecordingWorkingComponent;
  let fixture: ComponentFixture<RecordingWorkingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordingWorkingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordingWorkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
