import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../../layout/pagination/pagination.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import {
  allRegisterTransfers,
  EquipmentForSelection,
  RegisterTransfersResponse,
} from '../../../types/RegisterTransfers.type';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss',
})
export class TransfersComponent implements OnInit {
  //getEquipmentsForSelection
  allEquipmentsForSelection: EquipmentForSelection[] = [];
  //table
  allRegisterTransfers: allRegisterTransfers[] = [];
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;
  showFilter = false;
  filterForm: FormGroup;

  //form
  @ViewChild('form') form!: NgForm;
  @ViewChild('form', { static: false, read: ElementRef })
  formElement!: ElementRef<HTMLFormElement>;

  @ViewChild('editForm') editForm!: NgForm;
  @ViewChild('editForm', { static: false, read: ElementRef })
  editFormElement!: ElementRef<HTMLFormElement>;

  isLoading: boolean = false;
  Loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  registerTransfers: {
    date: string;
    transfersNumber: number;
    priceForTransfer: number;
    extraBonus: number;
    notes: string;
    equipmentId: number | null;
  } = {
    date: '',
    transfersNumber: 0,
    priceForTransfer: 0,
    extraBonus: 0,
    notes: '',
    equipmentId: null,
  };

  //edit
  // للتحكم في مودال التعديل
  showEditModal = false;
  currentEditingRegisterTransfersId: number | null = null; // ID الموظف اللي بنعدله

  editRegisterTransfers: {
    equipmentOwnerName: string;
    date: string;
    transfersNumber: number;
    priceForTransfer: number;
    extraBonus: number;
    notes: string;
    equipmentId: number;
  } = {
    equipmentOwnerName: '',
    date: '',
    transfersNumber: 0,
    priceForTransfer: 0,
    extraBonus: 0,
    notes: '',
    equipmentId: 0,
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      EquipmentOwnerName: [''],
      fromDate: [''],
      toDate: [''],
    });
  }

  ngOnInit(): void {
    this.loadAllRegisterTransfers(1);
    this.loadEquipmentForDropdown();

    // استمع لأي تغيير في الفورم وفلتر فورًا
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500), // انتظر نص ثانية بعد آخر ضغطة عشان ما يبعتش كل حرف
        distinctUntilChanged() // لو ما تغيرش القيمة ما يعملش شيء
      )
      .subscribe(() => {
        this.currentPage = 1; // ارجع للصفحة الأولى عند أي فلترة جديدة
        this.applyFilter();
      });
  }

  //get all EmployeesStakeholder
  loadEquipmentForDropdown() {
    this.Loading = true;
    this.apiService.getEquipmentsForDropdown().subscribe({
      next: (equipments: EquipmentForSelection[]) => {
        this.allEquipmentsForSelection = equipments || [];
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading equipments:', err);
        this.allEquipmentsForSelection = [];
        this.Loading = false;
      },
    });
  }

  //ger all RegisterTransfers
  loadAllRegisterTransfers(
    page: number,
    params: HttpParams = new HttpParams()
  ): void {
    this.Loading = true;
    this.currentPage = page;

    // نضيف الـ pagination دايمًا
    params = params.set('page', page.toString());
    params = params.set('pageSize', this.pageSize.toString());

    this.apiService.getAllRegisterTransfers(params).subscribe({
      next: (res: RegisterTransfersResponse) => {
        this.allRegisterTransfers = res.data?.data || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.currentPage = res.data?.pageNumber || page;
        this.Loading = false;
      },
      error: () => {
        this.allRegisterTransfers = [];
        this.Loading = false;
      },
    });
  }

  private applyFilter(): void {
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.EquipmentOwnerName?.trim()) {
      params = params.set(
        'EquipmentOwnerName',
        value.EquipmentOwnerName.trim()
      ); // lowercase زي الـ API
    }
    if (value.fromDate?.trim()) {
      params = params.set('fromDate', value.fromDate.trim());
    }
    if (value.toDate?.trim()) {
      params = params.set('toDate', value.toDate.trim());
    }

    this.loadAllRegisterTransfers(1, params);
  }

  onFilter(): void {
    this.currentPage = 1;
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.EquipmentOwnerName?.trim())
      params = params.set(
        'EquipmentOwnerName',
        value.EquipmentOwnerName.trim()
      );
    if (value.fromDate?.trim())
      params = params.set('fromDate', value.fromDate.trim());
    if (value.toDate?.trim())
      params = params.set('toDate', value.toDate.trim());
    this.loadAllRegisterTransfers(1, params);
  }

  onClear(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAllRegisterTransfers(1); // بدون params
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) return;

    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.EquipmentOwnerName?.trim())
      params = params.set(
        'EquipmentOwnerName',
        value.EquipmentOwnerName.trim()
      );
    if (value.fromDate?.trim())
      params = params.set('fromDate', value.fromDate.trim());
    if (value.toDate?.trim())
      params = params.set('toDate', value.toDate.trim());
    this.loadAllRegisterTransfers(page, params);
  }

  //اجمع الفلاتر من الـ form
  getFilterParams(): HttpParams {
    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.EquipmentOwnerName?.trim())
      params = params.set(
        'EquipmentOwnerName',
        value.EquipmentOwnerName.trim()
      );
    if (value.fromDate?.trim())
      params = params.set('fromDate', value.fromDate.trim());
    if (value.toDate?.trim())
      params = params.set('toDate', value.toDate.trim());
    return params;
  }

  //add Sold form submit
  async handleSubmit(): Promise<void> {
    this.form.form.markAllAsTouched();
    this.formElement.nativeElement.classList.add('was-validated');

    if (!this.form.valid || !this.registerTransfers.equipmentId) {
      return;
    }

    this.isLoading = true;

    const body = {
      date: this.registerTransfers.date.trim(),
      transfersNumber: this.registerTransfers.transfersNumber,
      priceForTransfer: this.registerTransfers.priceForTransfer,
      extraBonus: this.registerTransfers.extraBonus,
      notes: this.registerTransfers.notes.trim(),
      equipmentId: this.registerTransfers.equipmentId,
    };

    try {
      const result = await firstValueFrom(
        this.apiService.addRegisterTransfers(body)
      );
      // result دايمًا هيبقى object فيه success و message
      if (result.success) {
        this.successMessage = 'تم إضافة النقلة بنجاح';
        this.resetAddForm();
        this.loadAllRegisterTransfers(1);
      } else {
        this.errorMessage = result.message || 'حدث خطأ';
      }
    } catch {
      this.errorMessage = 'فشل الاتصال بالخادم';
    } finally {
      this.isLoading = false;
      setTimeout(() => (this.successMessage = this.errorMessage = null), 3000);
    }
  }

  private resetAddForm() {
    this.form.resetForm();
    this.registerTransfers = {
      date: '',
      transfersNumber: 0,
      priceForTransfer: 0,
      extraBonus: 0,
      notes: '',
      equipmentId: null,
    };
    this.formElement.nativeElement.classList.remove('was-validated');
  }

  // جلب بيانات سجل نقلات واحد للتعديل
  loadRegisterTransfersForEdit(id: number) {
    this.Loading = true;
    this.apiService.getRegisterTransfersById(id).subscribe({
      next: (res) => {
        const registerTransfers = res;
        this.editRegisterTransfers = {
          equipmentOwnerName: registerTransfers.equipmentOwnerName || '',
          date: registerTransfers.date || '',
          transfersNumber: registerTransfers.transfersNumber || 0,
          priceForTransfer: registerTransfers.priceForTransfer || 0,
          extraBonus: registerTransfers.extraBonus || 0,
          notes: registerTransfers.notes || '',
          equipmentId: registerTransfers.equipmentId || null,
        };
        this.currentEditingRegisterTransfersId = id;
        this.showEditModal = true;
        this.cdr.detectChanges();
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading registerTransfers for edit:', err);
        this.errorMessage = 'فشل جلب بيانات النقلة';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateRegisterTransfers(): Promise<void> {
    this.editForm.form.markAllAsTouched();
    this.editFormElement.nativeElement.classList.add('was-validated');

    if (!this.editForm.valid) return;

    this.isLoading = true;

    const body = {
      date: this.editRegisterTransfers.date.trim(),
      transfersNumber: this.editRegisterTransfers.transfersNumber,
      priceForTransfer: this.editRegisterTransfers.priceForTransfer,
      extraBonus: this.editRegisterTransfers.extraBonus,
      notes: this.editRegisterTransfers.notes.trim(),
      equipmentId: this.editRegisterTransfers.equipmentId,
    };

    try {
      const result = await firstValueFrom(
        this.apiService.updateRegisterTransfers(
          this.currentEditingRegisterTransfersId!,
          body
        )
      );

      if (result.success) {
        this.successMessage = 'تم تعديل بيانات النقلة بنجاح ✓';
        this.showEditModal = false;
        this.loadAllRegisterTransfers(this.currentPage); // تحديث الجدول
        setTimeout(() => (this.successMessage = null), 3000);
      } else {
        this.errorMessage = result.message || 'حدث خطأ أثناء التعديل';
        setTimeout(() => (this.errorMessage = null), 3000);
      }
    } catch (err: any) {
      this.errorMessage = 'فشل الاتصال بالخادم';
      setTimeout(() => (this.errorMessage = null), 3000);
    } finally {
      this.isLoading = false;
      setTimeout(() => (this.successMessage = this.errorMessage = null), 3000);
    }
  }

  deletedRegisterTransfers(id: number) {
    if (confirm('هل أنت متأكد من  حذف هذا السجل؟')) {
      this.Loading = true;
      this.apiService.deleteRegisterTransfers(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف السجل بنجاح';
          setTimeout(() => {
            this.successMessage = null;
            const params = this.getFilterParams(); // نفس الفلاتر
            this.loadAllRegisterTransfers(this.currentPage, params); // نفس الصفحة
          }, 2000);
          this.Loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(`خطأ في حذف السجل ${id}:`, error);
          this.errorMessage = 'فشل حذف السجل';
          this.Loading = false;
          setTimeout(() => {
            this.errorMessage = null;
          }, 2000);
          this.cdr.detectChanges();
        },
      });
    }
  }
}
