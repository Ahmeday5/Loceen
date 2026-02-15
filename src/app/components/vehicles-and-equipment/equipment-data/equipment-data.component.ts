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
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  of,
  timeout,
} from 'rxjs';
import { PaginationComponent } from '../../../layout/pagination/pagination.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { allStakeholder } from '../../../types/stackhoder.type';
import { allEquipment } from '../../../types/equipment.type';

@Component({
  selector: 'app-equipment-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './equipment-data.component.html',
  styleUrl: './equipment-data.component.scss',
})
export class EquipmentDataComponent implements OnInit {
  //table
  allEquipment: allEquipment[] = [];
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

  equipment: {
    equipmentNumber: string;
    equipmentType: string;
    workSystem: string;
    equipmentOwnerName: string;
    equipmentOwnerPhone: string;
  } = {
    equipmentNumber: '',
    equipmentType: '',
    workSystem: '',
    equipmentOwnerName: '',
    equipmentOwnerPhone: '',
  };

  //edit
  // للتحكم في مودال التعديل
  showEditModal = false;
  currentEditingEquipmentId: number | null = null; // ID الموظف اللي بنعدله

  editEquipment: {
    equipmentNumber: string;
    equipmentType: string;
    workSystem: string;
    equipmentOwnerName: string;
    equipmentOwnerPhone: string;
  } = {
    equipmentNumber: '',
    equipmentType: '',
    workSystem: '',
    equipmentOwnerName: '',
    equipmentOwnerPhone: '',
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      EquipmentNumber: [''],
      EquipmentType: [''],
      EquipmentOwnerName: [''],
    });
  }

  ngOnInit(): void {
    this.loadAllEquipment(1);
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

  //ger all Equipment
  loadAllEquipment(page: number, params: HttpParams = new HttpParams()): void {
    this.Loading = true;
    this.currentPage = page;

    params = params.set('page', page.toString());
    params = params.set('pageSize', this.pageSize.toString());

    this.apiService
      .getAllEquipment(params)
      .pipe(
        // أضف timeout عشان ما يعلقش للأبد
        timeout(15000), // 15 ثانية كحد أقصى
        catchError((err) => {
          console.error('Critical error in allEquipment:', err);
          if (err.name === 'TimeoutError') {
            this.errorMessage = 'انتهت مهلة الاتصال بالخادم (timeout)';
          } else {
            this.errorMessage = 'حدث خطأ أثناء جلب البيانات';
          }
          return of(null); // نرجع null عشان نعرف إنه فشل
        })
      )
      .subscribe({
        next: (res) => {
          this.Loading = false;

          if (!res) {
            this.allEquipment = [];
            this.totalCount = 0;
            return;
          }

          const data = res.data;
          this.allEquipment = data?.data || [];
          this.totalCount = data?.pagination?.totalCount || 0;
          this.totalPages =
            data?.pagination?.totalPages ||
            Math.ceil(this.totalCount / this.pageSize);
          this.currentPage = data?.pagination?.currentPage || page;
        },
        error: (err) => {
          // هنا مش المفروض يدخل كتير بسبب catchError فوق
          this.Loading = false;
          console.error(err);
        },
        complete: () => {
          this.Loading = false; // ← ضمان إضافي
        },
      });
  }

  private applyFilter(): void {
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.EquipmentNumber?.trim()) {
      params = params.set('EquipmentNumber', value.EquipmentNumber.trim()); // lowercase زي الـ API
    }
    if (value.EquipmentType?.trim()) {
      params = params.set('EquipmentType', value.EquipmentType.trim());
    }
    if (value.EquipmentOwnerName?.trim()) {
      params = params.set(
        'EquipmentOwnerName',
        value.EquipmentOwnerName.trim()
      );
    }

    this.loadAllEquipment(1, params);
  }

  onFilter(): void {
    this.currentPage = 1;
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.EquipmentNumber?.trim())
      params = params.set('EquipmentNumber', value.EquipmentNumber.trim());
    if (value.EquipmentType?.trim())
      params = params.set('EquipmentType', value.EquipmentType.trim());
    if (value.EquipmentOwnerName?.trim())
      params = params.set(
        'EquipmentOwnerName',
        value.EquipmentOwnerName.trim()
      );
    this.loadAllEquipment(1, params);
  }

  onClear(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAllEquipment(1); // بدون params
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) return;

    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.EquipmentNumber?.trim())
      params = params.set('EquipmentNumber', value.EquipmentNumber.trim());
    if (value.EquipmentType?.trim())
      params = params.set('EquipmentType', value.EquipmentType.trim());
    if (value.EquipmentOwnerName?.trim())
      params = params.set(
        'EquipmentOwnerName',
        value.EquipmentOwnerName.trim()
      );
    this.loadAllEquipment(page, params);
  }

  //اجمع الفلاتر من الـ form
  getFilterParams(): HttpParams {
    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.EquipmentNumber?.trim())
      params = params.set('EquipmentNumber', value.EquipmentNumber.trim());
    if (value.EquipmentType?.trim())
      params = params.set('EquipmentType', value.EquipmentType.trim());
    if (value.EquipmentOwnerName?.trim())
      params = params.set(
        'EquipmentOwnerName',
        value.EquipmentOwnerName.trim()
      );
    return params;
  }

  //add stakeholder form submit
  async handleSubmit(): Promise<void> {
    this.form.form.markAllAsTouched();
    this.formElement.nativeElement.classList.add('was-validated');

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      equipmentNumber: this.equipment.equipmentNumber,
      equipmentType: this.equipment.equipmentType.trim(),
      workSystem: this.equipment.workSystem.trim(),
      equipmentOwnerName: this.equipment.equipmentOwnerName.trim(),
      equipmentOwnerPhone: this.equipment.equipmentOwnerPhone,
    };

    try {
      const result = await firstValueFrom(this.apiService.addEquipment(body));

      // result دايمًا هيبقى object فيه success و message
      if (result.success) {
        this.successMessage = 'تم إضافة المعدة بنجاح ✓';
        this.resetForm();
        setTimeout(() => (this.successMessage = null), 2000);
        this.loadAllEquipment(1);
      } else {
        // هندل الرسالة الخاصة بالتكرار
        if (
          result.message &&
          result.message.includes('saving the entity changes')
        ) {
          this.errorMessage = 'فشل إضافة المعدة';
        } else {
          this.errorMessage = result.message || 'حدث خطأ أثناء إضافة العامل';
        }
        setTimeout(() => (this.errorMessage = null), 2000);
      }
    } catch (err: any) {
      // أي خطأ في الاتصال أو السيرفر
      this.errorMessage = 'فشل الاتصال بالخادم، حاول مرة أخرى';
      setTimeout(() => (this.errorMessage = null), 2000);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private resetForm(): void {
    this.form.resetForm();
    this.equipment = {
      equipmentNumber: '',
      equipmentType: '',
      workSystem: '',
      equipmentOwnerName: '',
      equipmentOwnerPhone: '',
    };
    this.formElement.nativeElement.classList.remove('was-validated');
  }

  // جلب بيانات معدة واحدة للتعديل
  loadEquipmentForEdit(id: number): void {
    this.Loading = true;

    this.apiService.getEquipmentById(id).subscribe({
      next: (res) => {
        const equi = res ?? {};

        // نملأ البيانات في equi
        this.editEquipment = {
          equipmentNumber: equi.equipmentNumber || '',
          equipmentType: equi.equipmentType || '', // لو موجود
          workSystem: equi.workSystem || '',
          equipmentOwnerName: equi.equipmentOwnerName || '',
          equipmentOwnerPhone: equi.equipmentOwnerPhone || '',
        };

        this.currentEditingEquipmentId = id;
        this.showEditModal = true; // نفتح المودال
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading Equipment for edit:', err);
        this.errorMessage = 'فشل جلب بيانات العامل';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateEquipment(): Promise<void> {
    this.editForm.form.markAllAsTouched();
    this.editFormElement.nativeElement.classList.add('was-validated');

    if (!this.editForm.valid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      equipmentNumber: this.editEquipment.equipmentNumber,
      equipmentType: this.editEquipment.equipmentType.trim(),
      workSystem: this.editEquipment.workSystem.trim(),
      equipmentOwnerName: this.editEquipment.equipmentOwnerName.trim(),
      equipmentOwnerPhone: this.editEquipment.equipmentOwnerPhone,
    };

    try {
      const result = await firstValueFrom(
        this.apiService.updateEquipment(this.currentEditingEquipmentId!, body)
      );

      if (result.success) {
        this.successMessage = 'تم تعديل بيانات المعدة بنجاح ✓';
        this.showEditModal = false;
        this.loadAllEquipment(this.currentPage); // تحديث الجدول
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
    }
  }

  deletedEquipment(id: number) {
    if (confirm('هل أنت متأكد من  حذف هذا المعدة؟')) {
      this.Loading = true;
      this.apiService.deleteEquipment(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف المعدة بنجاح';
          setTimeout(() => {
            this.successMessage = null;
            const params = this.getFilterParams(); // نفس الفلاتر
            this.loadAllEquipment(this.currentPage, params); // نفس الصفحة
          }, 2000);
          this.Loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(`خطأ في حذف المعدة ${id}:`, error);
          this.errorMessage = 'فشل حذف المعدة';
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
