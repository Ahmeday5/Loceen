import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingReceiptsComponent } from './recording-receipts.component';

describe('RecordingReceiptsComponent', () => {
  let component: RecordingReceiptsComponent;
  let fixture: ComponentFixture<RecordingReceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordingReceiptsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordingReceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
