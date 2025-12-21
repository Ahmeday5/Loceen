import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inquiry-percentage-system',
  standalone: true,
  imports: [],
  templateUrl: './inquiry-percentage-system.component.html',
  styleUrl: './inquiry-percentage-system.component.scss'
})

export class InquiryPercentageSystemComponent {
  filterForm: FormGroup;
  showFilter = false;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      status: [''],
      buyerName: [''],
      supplierType: [''],
    });
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onClear(): void {
    this.filterForm.reset();
  }
}
