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
import { allWorkHours, WorkHoursResponse } from '../../../types/WorkHours.type';
import { EquipmentForSelection } from '../../../types/RegisterTransfers.type';

@Component({
  selector: 'app-working-hours',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './working-hours.component.html',
  styleUrl: './working-hours.component.scss',
})
export class WorkingHoursComponent implements OnInit {
  //getEquipmentsForSelection
  allEquipmentsForSelection: EquipmentForSelection[] = [];
  //table
  allWorkHour: allWorkHours[] = [];
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

  WorkHour: {
    date: string;
    hoursNumber: number;
    price: number;
    extraBonus: number;
    notes: string;
    equipmentId: number | null;
  } = {
    date: '',
    hoursNumber: 0,
    price: 0,
    extraBonus: 0,
    notes: '',
    equipmentId: null,
  };

  //edit
  // للتحكم في مودال التعديل
  showEditModal = false;
  currentEditingWorkHourId: number | null = null; // ID الموظف اللي بنعدله

  editWorkHour: {
    equipmentOwnerName: string;
    date: string;
    hoursNumber: number;
    price: number;
    extraBonus: number;
    notes: string;
    equipmentId: number;
  } = {
    equipmentOwnerName: '',
    date: '',
    hoursNumber: 0,
    price: 0,
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
    this.loadAllWorkHours(1);
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

  //ger all WorkHours
  loadAllWorkHours(page: number, params: HttpParams = new HttpParams()): void {
    this.Loading = true;
    this.currentPage = page;

    // نضيف الـ pagination دايمًا
    params = params.set('page', page.toString());
    params = params.set('pageSize', this.pageSize.toString());

    this.apiService.getAllWorkHours(params).subscribe({
      next: (res: WorkHoursResponse) => {
        this.allWorkHour = res.data?.data || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.currentPage = res.data?.pageNumber || page;
        this.Loading = false;
      },
      error: () => {
        this.allWorkHour = [];
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

    this.loadAllWorkHours(1, params);
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
    this.loadAllWorkHours(1, params);
  }

  onClear(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAllWorkHours(1); // بدون params
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
    this.loadAllWorkHours(page, params);
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

    if (!this.form.valid || !this.WorkHour.equipmentId) {
      return;
    }

    this.isLoading = true;

    const body = {
      date: this.WorkHour.date.trim(),
      hoursNumber: this.WorkHour.hoursNumber,
      price: this.WorkHour.price,
      extraBonus: this.WorkHour.extraBonus,
      notes: this.WorkHour.notes.trim(),
      equipmentId: this.WorkHour.equipmentId,
    };

    try {
      const result = await firstValueFrom(this.apiService.addWorkHours(body));
      // result دايمًا هيبقى object فيه success و message
      if (result.success) {
        this.successMessage = 'تم إضافة ساعة العمل بنجاح';
        this.resetAddForm();
        this.loadAllWorkHours(1);
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
    this.WorkHour = {
      date: '',
      hoursNumber: 0,
      price: 0,
      extraBonus: 0,
      notes: '',
      equipmentId: null,
    };
    this.formElement.nativeElement.classList.remove('was-validated');
  }

  // جلب بيانات معدة واحدة للتعديل
  loadWorkHourForEdit(id: number): void {
    this.Loading = true;

    this.apiService.getWorkHoursById(id).subscribe({
      next: (res) => {
        const WorkHour = res;
        // نملأ البيانات في editWorkHour
        this.editWorkHour = {
          equipmentOwnerName: WorkHour.equipmentOwnerName ?? '',
          date: WorkHour.date ?? '',
          hoursNumber: WorkHour.hoursNumber ?? 0,
          price: WorkHour.price ?? 0,
          extraBonus: WorkHour.extraBonus ?? 0,
          notes: WorkHour.notes ?? '',
          equipmentId: WorkHour.equipmentId ?? null,
        };

        console.log(this.WorkHour);

        this.currentEditingWorkHourId = id;
        this.showEditModal = true; // نفتح المودال
        this.cdr.detectChanges();
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading expenses for edit:', err);
        this.errorMessage = 'فشل جلب بيانات ساعات العمل للتعديل';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateWorkHour(): Promise<void> {
    this.editForm.form.markAllAsTouched();
    this.editFormElement.nativeElement.classList.add('was-validated');

    if (!this.editForm.valid) return;

    this.isLoading = true;

    const body = {
      date: this.editWorkHour.date.trim(),
      hoursNumber: this.editWorkHour.hoursNumber,
      price: this.editWorkHour.price,
      extraBonus: this.editWorkHour.extraBonus,
      notes: this.editWorkHour.notes.trim(),
      equipmentId: this.editWorkHour.equipmentId,
    };

    try {
      const result = await firstValueFrom(
        this.apiService.updateWorkHours(this.currentEditingWorkHourId!, body)
      );

      if (result.success) {
        this.successMessage = 'تم تعديل بيانات ساعة العمل بنجاح ✓';
        this.showEditModal = false;
        this.loadAllWorkHours(this.currentPage); // تحديث الجدول
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

  deletedWorkHour(id: number) {
    if (confirm('هل أنت متأكد من  حذف هذا ساعة العمل؟')) {
      this.Loading = true;
      this.apiService.deleteWorkHours(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف ساعة العمل بنجاح';
          setTimeout(() => {
            this.successMessage = null;
            const params = this.getFilterParams(); // نفس الفلاتر
            this.loadAllWorkHours(this.currentPage, params); // نفس الصفحة
          }, 2000);
          this.Loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(`خطأ في حذف ساعة العمل ${id}:`, error);
          this.errorMessage = 'فشل حذف ساعة العمل';
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
