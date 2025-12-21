import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inquiry-about-employee-eccounts',
  standalone: true,
  imports: [],
  templateUrl: './inquiry-about-employee-eccounts.component.html',
  styleUrl: './inquiry-about-employee-eccounts.component.scss',
})
export class InquiryAboutEmployeeEccountsComponent {
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
