import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inquiry-equipment',
  standalone: true,
  imports: [],
  templateUrl: './inquiry-equipment.component.html',
  styleUrl: './inquiry-equipment.component.scss',
})
export class InquiryEquipmentComponent {
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
