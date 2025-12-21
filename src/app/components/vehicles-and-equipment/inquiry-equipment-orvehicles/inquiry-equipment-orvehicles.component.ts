import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inquiry-equipment-orvehicles',
  standalone: true,
  imports: [],
  templateUrl: './inquiry-equipment-orvehicles.component.html',
  styleUrl: './inquiry-equipment-orvehicles.component.scss',
})
export class InquiryEquipmentORvehiclesComponent {
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
