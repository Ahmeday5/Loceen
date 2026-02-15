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
import {
  allEmployees,
  allWorkLocations,
  allWorkLocationsResponse,
} from '../../../types/employee.type';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent implements OnInit {
  //getWorkLocation
  allWorkLocations: allWorkLocations[] = [];
  //table
  allEmployees: allEmployees[] = [];
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

  isLoading: boolean = false;
  Loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  employee: {
    name: string;
    workSystem: string;
    accountNumber: string;
    phone: string;
    notes: string;
    workLocationId: number;
  } = {
    name: '',
    workSystem: '',
    accountNumber: '',
    phone: '',
    notes: '',
    workLocationId: 0,
  };

  WorkLocation: {
    name: string;
    groupNumber: number;
  } = {
    name: '',
    groupNumber: 0,
  };
  // للتحكم في إضافة موقع جديد
  showAddLocationModal = false;
  newLocationName = '';
  groupNumber = 0;

  // للتحكم في مودال التعديل
  showEditModal = false;
  currentEditingEmployeeId: number | null = null; // ID الموظف اللي بنعدله

  // نسخة من بيانات الموظف للتعديل (عشان ما نعدلش على الأصلي مباشرة)
  editEmployee: {
    name: string;
    workSystem: string;
    accountNumber: string;
    phone: string;
    notes: string;
    workLocationId: number;
  } = {
    name: '',
    workSystem: '',
    accountNumber: '',
    phone: '',
    notes: '',
    workLocationId: 0,
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      workLocation: [''],
    });
  }

  ngOnInit(): void {
    this.loadAllWorkLocations();
    this.loadAllEmployees(1);

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

  private applyFilter(): void {
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.name?.trim()) {
      params = params.set('EmployeeName', value.name.trim()); // lowercase زي الـ API
    }
    if (value.workLocation?.trim()) {
      params = params.set('LocationName', value.workLocation.trim());
    }

    this.loadAllEmployees(1, params);
  }

  onFilter(): void {
    this.currentPage = 1;
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.name?.trim())
      params = params.set('EmployeeName', value.name.trim());
    if (value.workLocation)
      params = params.set('LocationName', value.workLocation);
    this.loadAllEmployees(1, params);
  }

  onClear(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAllEmployees(1); // بدون params
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) return;

    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.name?.trim())
      params = params.set('EmployeeName', value.name.trim());
    if (value.workLocation)
      params = params.set('LocationName', value.workLocation);
    this.loadAllEmployees(page, params);
  }

  //اجمع الفلاتر من الـ form
  getFilterParams(): HttpParams {
    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.name?.trim())
      params = params.set('EmployeeName', value.name.trim());
    if (value.workLocation)
      params = params.set('LocationName', value.workLocation);
    return params;
  }

  //ger all Employees
  loadAllEmployees(page: number, params: HttpParams = new HttpParams()): void {
    this.Loading = true;
    this.currentPage = page;

    params = params.set('page', page.toString());
    params = params.set('pageSize', this.pageSize.toString());

    this.apiService
      .getAllEmployees(params)
      .pipe(
        // أضف timeout عشان ما يعلقش للأبد
        timeout(15000), // 15 ثانية كحد أقصى
        catchError((err) => {
          console.error('Critical error in Employees:', err);
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
            this.allEmployees = [];
            this.totalCount = 0;
            return;
          }

          const data = res.data;
          this.allEmployees = data?.data || [];
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

  // لتتبع الموقع المختار (واحد بس)
  selectWorkLocation(locationId: number) {
    this.employee.workLocationId = locationId;
  }

  //get all EmployeesStakeholder
  loadAllWorkLocations(): void {
    this.Loading = true;
    this.apiService.getAllWorkLocations().subscribe({
      next: (res) => {
        const data = res.data;
        this.allWorkLocations = res.data || [];
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading allWorkLocations:', err);
        this.allWorkLocations = [];
        this.Loading = false;
      },
    });
  }

  //add stakeholder form handleSubmit
  async handleSubmit(): Promise<void> {
    this.form.form.markAllAsTouched();
    this.formElement.nativeElement.classList.add('was-validated');

    // تحقق إضافي: لازم يختار عامل وموقع عمل
    if (!this.form.valid || !this.employee.workLocationId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      workLocationId: this.employee.workLocationId, // string عادي
      phone: this.employee.phone.trim(),
      notes: this.employee.notes.trim(),
      workSystem: this.employee.workSystem,
      accountNumber: this.employee.accountNumber,
      name: this.employee.name,
    };

    try {
      const result = await firstValueFrom(this.apiService.addEmployee(body));

      if (result.success) {
        this.successMessage = 'تم إضافة العامل بنجاح ✓';
        this.resetForm();
        setTimeout(() => (this.successMessage = null), 2000);
        this.loadAllEmployees(1);
      } else {
        // هندل الرسالة الخاصة بالتكرار
        if (
          result.message &&
          result.message.includes('saving the entity changes')
        ) {
          this.errorMessage =
            'هذا العامل تم إضافته كموظف من قبل، لا يمكن إضافته مرة أخرى';
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
    this.employee = {
      name: '',
      workSystem: '',
      accountNumber: '',
      phone: '',
      notes: '',
      workLocationId: 0,
    };
    this.formElement.nativeElement.classList.remove('was-validated');
  }

  //add WorkLocations form handleSubmitWorkLocation
  async handleSubmitWorkLocation(): Promise<void> {
    if (!this.newLocationName.trim()) {
      this.errorMessage = 'يرجى كتابة اسم الموقع';
      this.clearMessagesAfterDelay();
      return;
    }

    if (!this.groupNumber) {
      this.errorMessage = 'يرجى كتابة اسم المجموعة';
      this.clearMessagesAfterDelay();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const result = await firstValueFrom(
        this.apiService.addWorkLocation({
          name: this.newLocationName.trim(),
          groupNumber: this.groupNumber,
        })
      );

      if (result.success) {
        // نجاح → نقفل الـ Modal + نمسح الإنبوت + رسالة نجاح + تحديث
        this.successMessage = 'تم إضافة الموقع بنجاح ✓';
        this.newLocationName = '';
        this.groupNumber = 0;
        this.showAddLocationModal = false;
        this.loadAllWorkLocations();

        this.clearMessagesAfterDelay(3000); // تختفي بعد 3 ثواني
      } else {
        // خطأ (مثل الاسم موجود) → نقفل الـ Modal + نمسح الإنبوت + رسالة خطأ
        this.showAddLocationModal = false; // نقفل الـ Modal
        this.newLocationName = ''; // نمسح الإنبوت
        this.groupNumber = 0; // نمسح الإنبوت

        if (
          result.message &&
          result.message.toLowerCase().includes('already exists')
        ) {
          this.errorMessage = 'اسم موقع العمل موجود بالفعل، جرب اسم آخر';
        } else {
          this.errorMessage = result.message || 'حدث خطأ أثناء إضافة الموقع';
        }

        this.clearMessagesAfterDelay(3000); // رسالة الخطأ تختفي بعد 3 ثواني
      }
    } catch (err: any) {
      // خطأ في الاتصال أو السيرفر
      this.showAddLocationModal = false;
      this.newLocationName = '';
      this.groupNumber = 0;
      this.errorMessage = 'فشل الاتصال بالخادم، حاول مرة أخرى';
      this.clearMessagesAfterDelay(3000);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // دالة مساعدة لإخفاء الرسائل (نجاح أو خطأ) تلقائيًا
  private clearMessagesAfterDelay(delay: number = 3000): void {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
      this.cdr.detectChanges();
    }, delay);
  }

  // جلب بيانات موظف واحد للتعديل
  loadEmployeeForEdit(id: number): void {
    this.Loading = true;

    this.apiService.getEmployeeById(id).subscribe({
      next: (res) => {
        const emp = res ?? {};

        // نملأ البيانات في editEmployee
        this.editEmployee = {
          name: emp.name || '',
          workLocationId: emp.workLocationId || null, // لو موجود
          workSystem: emp.workSystem || '',
          phone: emp.phone || '',
          notes: emp.notes || '',
          accountNumber: emp.accountNumber || '',
        };

        this.currentEditingEmployeeId = id;
        this.showEditModal = true; // نفتح المودال
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading employee for edit:', err);
        this.errorMessage = 'فشل جلب بيانات العامل';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateEmployee(): Promise<void> {
    if (!this.editEmployee.workLocationId) {
      this.errorMessage = 'يرجى ملء جميع الحقول المطلوبة';
      setTimeout(() => (this.errorMessage = null), 3000);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      workLocationId: this.editEmployee.workLocationId,
      phone: this.editEmployee.phone.trim(),
      notes: this.editEmployee.notes.trim(),
      workSystem: this.editEmployee.workSystem.trim(),
      accountNumber: this.editEmployee.accountNumber.trim(),
      name: this.editEmployee.name.trim(),
    };

    try {
      const result = await firstValueFrom(
        this.apiService.updateEmployee(this.currentEditingEmployeeId!, body)
      );

      if (result.success) {
        this.successMessage = 'تم تعديل بيانات العامل بنجاح ✓';
        this.showEditModal = false;
        this.loadAllEmployees(this.currentPage); // تحديث الجدول
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

  deletedWorkLocation(id: number) {
    if (confirm('هل أنت متأكد من  حذف هذا الموقع؟')) {
      this.Loading = true;
      this.apiService.deleteWorkLocation(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف الموقع بنجاح';
          setTimeout(() => {
            this.successMessage = null;
            this.loadAllWorkLocations(); // نفس الصفحة
          }, 2000);
          this.Loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(`خطأ في حذف الموقع ${id}:`, error);
          this.Loading = false;
          if (error.status === 500) {
            this.errorMessage = 'لا يمكن حذف الموقع لأنه مرتبط بموظفين';
          } else {
            this.errorMessage = 'فشل حذف الموقع لأنه مرتبط بموظفين';
          }
          setTimeout(() => {
            this.errorMessage = null;
          }, 4000);
          this.cdr.detectChanges();
        },
      });
    }
  }

  deletedEmployee(id: number) {
    if (confirm('هل أنت متأكد من  حذف هذا العامل؟')) {
      this.Loading = true;
      this.apiService.deleteEmployee(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف العامل بنجاح';
          setTimeout(() => {
            this.successMessage = null;
            const params = this.getFilterParams(); // نفس الفلاتر
            this.loadAllEmployees(this.currentPage, params); // نفس الصفحة
          }, 2000);
          this.Loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(`خطأ في حذف العامل ${id}:`, error);
          this.errorMessage = 'فشل حذف العامل';
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
