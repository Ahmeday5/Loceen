import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../../layout/pagination/pagination.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import {
  allworkingperiods,
  employeesForSelection,
  workingperiodsResponse,
} from '../../../types/employeeAdvance.type';

@Component({
  selector: 'app-employee-advance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './employee-advance.component.html',
  styleUrl: './employee-advance.component.scss',
})
export class EmployeeAdvanceComponent implements OnInit {
  //getemployeesMain
  allEmployeesMain: employeesForSelection[] = [];
  //table
  allWorkingPeriod: allworkingperiods[] = [];
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

  workingPeriod: {
    startDate: string;
    endDate: string;
    extraWork: number;
    workSystem: string;
    salary: number;
    employeeId: number | null;
  } = {
    startDate: '',
    endDate: '',
    extraWork: 0,
    workSystem: '',
    salary: 0,
    employeeId: null,
  };

  //edit
  // للتحكم في مودال التعديل
  showEditModal = false;
  currentEditingWorkingPeriodId: number | null = null; // ID الموظف اللي بنعدله

  editWorkingPeriod: {
    employeeName: string;
    startDate: string;
    endDate: string;
    extraWork: number;
    workSystem: string;
    salary: number;
    employeeId: number | null;
  } = {
    employeeName: '',
    startDate: '',
    endDate: '',
    extraWork: 0,
    workSystem: '',
    salary: 0,
    employeeId: null,
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      EmployeeName: [''],
    });
  }

  ngOnInit(): void {
    this.loadAllemployeesMain();
    this.loadAllWorkingPeriod(1);

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

  //get all EmployeesMain
  loadAllemployeesMain(): void {
    this.Loading = true;
    this.apiService.getAllemployeesMain().subscribe({
      next: (employeesMain: employeesForSelection[]) => {
        this.allEmployeesMain = employeesMain || [];
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading employeesMain:', err);
        this.allEmployeesMain = [];
        this.Loading = false;
      },
    });
  }

  //ger all WorkingPeriod
  loadAllWorkingPeriod(
    page: number,
    params: HttpParams = new HttpParams()
  ): void {
    this.Loading = true;
    this.currentPage = page;

    // نضيف الـ pagination دايمًا
    params = params.set('page', page.toString());
    params = params.set('pageSize', this.pageSize.toString());

    this.apiService.getAllworkingperiods(params).subscribe({
      next: (res: workingperiodsResponse) => {
        this.allWorkingPeriod = res.data?.data || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.currentPage = res.data?.pageNumber || page;
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading allWorkingPeriod:', err);
        this.allWorkingPeriod = [];
        this.Loading = false;
      },
    });
  }

  private applyFilter(): void {
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.EmployeeName?.trim()) {
      params = params.set('EmployeeName', value.EmployeeName.trim()); // lowercase زي الـ API
    }

    this.loadAllWorkingPeriod(1, params);
  }

  onFilter(): void {
    this.currentPage = 1;
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.EmployeeName?.trim())
      params = params.set('EmployeeName', value.EmployeeName.trim());
    this.loadAllWorkingPeriod(1, params);
  }

  onClear(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAllWorkingPeriod(1); // بدون params
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) return;

    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.EmployeeName?.trim())
      params = params.set('EmployeeName', value.EmployeeName.trim());
    this.loadAllWorkingPeriod(page, params);
  }

  //اجمع الفلاتر من الـ form
  getFilterParams(): HttpParams {
    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.EmployeeName?.trim())
      params = params.set('EmployeeName', value.EmployeeName.trim());
    return params;
  }

  //add Sold form submit
  async handleSubmit(): Promise<void> {
    this.form.form.markAllAsTouched();
    this.formElement.nativeElement.classList.add('was-validated');

    if (!this.form.valid || !this.workingPeriod.employeeId) {
      return;
    }

    this.isLoading = true;

    const body = {
      startDate: this.workingPeriod.startDate,
      endDate: this.workingPeriod.endDate,
      extraWork: this.workingPeriod.extraWork,
      workSystem: this.workingPeriod.workSystem.trim(),
      salary: this.workingPeriod.salary,
      employeeId: this.workingPeriod.employeeId,
    };

    try {
      const result = await firstValueFrom(
        this.apiService.addworkingperiods(body)
      );
      // result دايمًا هيبقى object فيه success و message
      if (result.success) {
        this.successMessage = 'تم إضافة فترة العمل بنجاح';
        this.resetAddForm();
        this.loadAllWorkingPeriod(1);
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
    this.workingPeriod = {
      startDate: '',
      endDate: '',
      extraWork: 0,
      workSystem: '',
      salary: 0,
      employeeId: null,
    };
    this.formElement.nativeElement.classList.remove('was-validated');
  }

  // جلب بيانات سلفة واحدة للتعديل
  loadworkingPeriodForEdit(id: number): void {
    this.Loading = true;

    this.apiService.getworkingperiodById(id).subscribe({
      next: (res) => {
        const workingPeriod = res;
        // نملأ البيانات في editEmployeeAdvance
        this.editWorkingPeriod = {
          employeeName: workingPeriod.employeeName || '',
          startDate: workingPeriod.startDate,
          endDate: workingPeriod.endDate,
          extraWork: workingPeriod.extraWork,
          workSystem: workingPeriod.workSystem.trim(),
          salary: workingPeriod.salary,
          employeeId: workingPeriod.employeeId,
        };

        this.currentEditingWorkingPeriodId = id;
        this.showEditModal = true; // نفتح المودال
        this.cdr.detectChanges();
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading workingPeriod for edit:', err);
        this.errorMessage = 'فشل جلب بيانات السجل للتعديل';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateworkingPeriod(): Promise<void> {
    this.editForm.form.markAllAsTouched();
    this.editFormElement.nativeElement.classList.add('was-validated');

    if (!this.editForm.valid) return;

    this.isLoading = true;

    const body = {
      startDate: this.editWorkingPeriod.startDate,
      endDate: this.editWorkingPeriod.endDate,
      extraWork: this.editWorkingPeriod.extraWork,
      workSystem: this.editWorkingPeriod.workSystem.trim(),
      salary: this.editWorkingPeriod.salary,
      employeeId: this.editWorkingPeriod.employeeId,
    };

    try {
      const result = await firstValueFrom(
        this.apiService.updateworkingperiod(
          this.currentEditingWorkingPeriodId!,
          body
        )
      );

      if (result.success) {
        this.successMessage = 'تم تعديل بيانات فترة العمل بنجاح ✓';
        this.showEditModal = false;
        this.loadAllWorkingPeriod(this.currentPage); // تحديث الجدول
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

  deletedworkingperiod(id: number) {
    if (confirm('هل أنت متأكد من  حذف هذة فترة العمل؟')) {
      this.Loading = true;
      this.apiService.deleteworkingperiod(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف فترة العمل بنجاح';
          setTimeout(() => {
            this.successMessage = null;
            const params = this.getFilterParams(); // نفس الفلاتر
            this.loadAllWorkingPeriod(this.currentPage, params); // نفس الصفحة
          }, 2000);
          this.Loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(`خطأ في حذف فترة العمل ${id}:`, error);
          this.errorMessage = 'فشل حذف فترة العمل';
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
