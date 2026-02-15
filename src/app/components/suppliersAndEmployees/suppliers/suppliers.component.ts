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

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss',
})
export class SuppliersComponent implements OnInit {
  //table
  allStakeholder: allStakeholder[] = [];
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;
  showFilter = false;
  filterForm: FormGroup;

  //form
  @ViewChild('addForm') addForm!: NgForm;
  @ViewChild('addForm', { static: false, read: ElementRef })
  addFormElement!: ElementRef<HTMLFormElement>;

  isLoading: boolean = false;
  Loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  stackholder: {
    name: string;
    address: string;
    phone: string;
    accountNumber: string;
    activityType: string;
  } = {
    name: '',
    address: '',
    phone: '',
    accountNumber: '',
    activityType: '',
  };

  //edit
  @ViewChild('editForm') editForm!: NgForm;
  @ViewChild('editForm', { static: false, read: ElementRef })
  editFormElement!: ElementRef<HTMLFormElement>;
  // للتحكم في مودال التعديل
  showEditModal = false;
  currentEditingStackholderId: number | null = null; // ID الموظف اللي بنعدله

  editStackholder: {
    name: string;
    address: string;
    phone: string;
    accountNumber: string;
    activityType: string;
  } = {
    name: '',
    address: '',
    phone: '',
    accountNumber: '',
    activityType: '',
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      accountNumber: [''],
    });
  }

  ngOnInit(): void {
    this.loadAllStakeholders(1);

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

  //ger all stakeholders
  loadAllStakeholders(
    page: number,
    params: HttpParams = new HttpParams()
  ): void {
    this.Loading = true;
    this.currentPage = page;

    params = params.set('page', page.toString());
    params = params.set('pageSize', this.pageSize.toString());

    this.apiService
      .getAllStakeholders(params)
      .pipe(
        // أضف timeout عشان ما يعلقش للأبد
        timeout(15000), // 15 ثانية كحد أقصى
        catchError((err) => {
          console.error('Critical error in getAllStakeholders:', err);
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
            this.allStakeholder = [];
            this.totalCount = 0;
            return;
          }

          const data = res.data;
          this.allStakeholder = data?.data || [];
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

    if (value.name?.trim()) {
      params = params.set('Name', value.name.trim()); // lowercase زي الـ API
    }
    if (value.accountNumber?.trim()) {
      params = params.set('AccountNumber', value.accountNumber.trim());
    }

    this.loadAllStakeholders(1, params);
  }

  onFilter(): void {
    this.currentPage = 1;
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.name?.trim()) params = params.set('Name', value.name.trim());
    if (value.accountNumber)
      params = params.set('AccountNumber', value.accountNumber);
    this.loadAllStakeholders(1, params);
  }

  onClear(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAllStakeholders(1); // بدون params
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) return;

    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.name?.trim()) params = params.set('Name', value.name.trim());
    if (value.accountNumber)
      params = params.set('AccountNumber', value.accountNumber);
    this.loadAllStakeholders(page, params);
  }

  //اجمع الفلاتر من الـ form
  getFilterParams(): HttpParams {
    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.name?.trim()) params = params.set('Name', value.name.trim());
    if (value.accountNumber)
      params = params.set('AccountNumber', value.accountNumber);
    return params;
  }

  //add stakeholder form submit
  async handleSubmit(): Promise<void> {
    // السطرين دول هما السحر: بيخلوا كل الحقول تُعتبر "ملموسة" ويظهر الأخطاء فورًا
    this.addForm.form.markAllAsTouched(); // <--- مهم جدًا
    this.addFormElement.nativeElement.classList.add('was-validated'); // <--- ده لـ Bootstrap

    if (!this.addForm.valid) {
      // لو الفورم مش صح، وقف هنا ومتكملش
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      name: this.stackholder.name.trim(),
      address: this.stackholder.address.trim(),
      phone: this.stackholder.phone.trim(),
      accountNumber: this.stackholder.accountNumber.trim(),
      activityType: this.stackholder.activityType.trim(),
    };

    try {
      const result = await firstValueFrom(this.apiService.addStakeholder(body));

      // result دايمًا هيبقى object فيه success و message
      if (result.success) {
        this.successMessage = 'تم إضافة الحساب بنجاح ✓';
        this.addForm.resetForm();
        this.stackholder.name = '';
        this.stackholder.address = '';
        this.stackholder.phone = '';
        this.stackholder.accountNumber = '';
        this.stackholder.activityType = '';
        this.addFormElement.nativeElement.classList.remove('was-validated');
        setTimeout(() => (this.successMessage = null), 2000);
        this.loadAllStakeholders(1);
      } else {
        this.errorMessage = result.message;
      }
    } catch (err: any) {
      this.errorMessage = err?.message || 'حدث خطأ غير متوقع';
      console.error('خطأ غير متوقع:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // جلب بيانات موظف واحد للتعديل
  loadStackholderForEdit(id: number): void {
    this.Loading = true;

    this.apiService.getStackholderById(id).subscribe({
      next: (res) => {
        // الـ response نفسه هو الكائن المطلوب (مش داخل data)
        const stack = res ?? {}; // لو الـ res جاء null/undefined نعمل fallback

        this.editStackholder = {
          name: stack.name ?? '',
          address: stack.address ?? '',
          phone: stack.phone ?? '',
          accountNumber: stack.accountNumber ?? '',
          activityType: stack.activityType ?? '',
        };

        this.currentEditingStackholderId = id;
        this.showEditModal = true;
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading trader for edit:', err);
        this.errorMessage = 'فشل في جلب بيانات التاجر/المورد';
        setTimeout(() => (this.errorMessage = null), 4000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateStakeholder(): Promise<void> {
    // السطرين دول هما السحر: بيخلوا كل الحقول تُعتبر "ملموسة" ويظهر الأخطاء فورًا
    this.editForm.form.markAllAsTouched(); // <--- مهم جدًا
    this.editFormElement.nativeElement.classList.add('was-validated'); // <--- ده لـ Bootstrap
    this.Loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      name: this.editStackholder.name,
      phone: this.editStackholder.phone,
      address: this.editStackholder.address,
      accountNumber: this.editStackholder.accountNumber,
      activityType: this.editStackholder.activityType,
    };

    try {
      const result = await firstValueFrom(
        this.apiService.updateStackholder(
          this.currentEditingStackholderId!,
          body
        )
      );

      if (result.success) {
        this.successMessage = 'تم تعديل بيانات التاجر/المورد بنجاح ✓';
        this.showEditModal = false;
        this.loadAllStakeholders(this.currentPage); // تحديث الجدول
        setTimeout(() => (this.successMessage = null), 3000);
      } else {
        this.errorMessage = result.message || 'حدث خطأ أثناء التعديل';
        setTimeout(() => (this.errorMessage = null), 3000);
      }
    } catch (err: any) {
      this.errorMessage = 'فشل الاتصال بالخادم';
      setTimeout(() => (this.errorMessage = null), 3000);
    } finally {
      this.Loading = false;
    }
  }

  deletedStakeholder(id: number) {
    if (confirm('هل أنت متأكد من  حذف هذا التاجر/المورد؟')) {
      this.Loading = true;
      this.apiService.deletetStackholder(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف التاجر/المورد بنجاح';
          setTimeout(() => {
            this.successMessage = null;
            const params = this.getFilterParams(); // نفس الفلاتر
            this.loadAllStakeholders(this.currentPage, params); // نفس الصفحة
          }, 2000);
          this.Loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(`خطأ في حذف التاجر/المورد ${id}:`, error);
          this.errorMessage = 'فشل حذف التاجر/المورد';
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
