import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss',
})
export class TransfersComponent {
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
