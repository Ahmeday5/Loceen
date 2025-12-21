import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inquiry-employees',
  standalone: true,
  imports: [],
  templateUrl: './inquiry-employees.component.html',
  styleUrl: './inquiry-employees.component.scss',
})
export class InquiryEmployeesComponent {
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
