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
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../layout/pagination/pagination.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { allReceivables } from '../../types/receivable.type';
import { TraderForSelection } from '../../types/expense.type';
import { allWorkLocations } from '../../types/employee.type';

@Component({
  selector: 'app-recording-receipts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './recording-receipts.component.html',
  styleUrl: './recording-receipts.component.scss',
})
export class RecordingReceiptsComponent implements OnInit {
  //getEmployeesStakeholder
  allTraders: TraderForSelection[] = [];
  allWorkLocations: allWorkLocations[] = [];
  //table
  allReceivable: allReceivables[] = [];
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

  receivable = {
    date: '',
    procurementStatement: '',
    total: 0,
    notes: '',
    workLocationId: null as number | null,
    traderId: null as number | null,
  };

  //edit
  // للتحكم في مودال التعديل
  showEditModal = false;
  currentEditingReceivableId: number | null = null; // ID الموظف اللي بنعدله

  editReceivable = {
    traderName: '',
    date: '',
    procurementStatement: '',
    total: 0,
    notes: '',
    workLocationId: null as number | null,
    traderId: null as number | null,
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      LocationName: [''],
      GroupNumber: [''],
      fromDate: [''],
      toDate: [''],
    });
  }

  ngOnInit(): void {
    this.loadAllReceivables(1);
    this.loadTradersForDropdown();
    this.loadAllWorkLocations();
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
  loadAllWorkLocations(): void {
    this.Loading = true;
    this.apiService.getAllWorkLocations().subscribe({
      next: (res) => {
        const data = res.data;
        this.allWorkLocations = data || [];
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading allWorkLocations:', err);
        this.allWorkLocations = [];
        this.Loading = false;
      },
    });
  }

  loadTradersForDropdown() {
    this.Loading = true;
    this.apiService.getTradersForDropdown().subscribe({
      next: (traders: TraderForSelection[]) => {
        this.allTraders = traders || [];
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading traders:', err);
        this.allTraders = [];
        this.Loading = false;
      },
    });
  }

  //ger all Receivables
  loadAllReceivables(
    page: number,
    params: HttpParams = new HttpParams()
  ): void {
    this.Loading = true;
    this.currentPage = page;

    // نضيف الـ pagination دايمًا
    params = params.set('page', page.toString());
    params = params.set('pageSize', this.pageSize.toString());

    this.apiService.getAllReceivables(params).subscribe({
      next: (res) => {
        const data = res.data;
        this.allReceivable = data.data || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.currentPage = res.data?.pageNumber || page;
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading AllReceivables:', err);
        this.allReceivable = [];
        this.Loading = false;
      },
    });
  }

  private applyFilter(): void {
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.GroupNumber?.trim()) {
      params = params.set('GroupNumber', value.GroupNumber.trim()); // lowercase زي الـ API
    }
    if (value.LocationName?.trim()) {
      params = params.set('LocationName', value.LocationName.trim());
    }
    if (value.fromDate?.trim()) {
      params = params.set('fromDate', value.fromDate.trim());
    }
    if (value.toDate?.trim()) {
      params = params.set('toDate', value.toDate.trim());
    }

    this.loadAllReceivables(1, params);
  }

  onFilter(): void {
    this.currentPage = 1;
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.GroupNumber?.trim())
      params = params.set('GroupNumber', value.GroupNumber.trim());
    if (value.LocationName?.trim())
      params = params.set('LocationName', value.LocationName.trim());
    if (value.fromDate?.trim())
      params = params.set('fromDate', value.fromDate.trim());
    if (value.toDate?.trim())
      params = params.set('toDate', value.toDate.trim());
    this.loadAllReceivables(1, params);
  }

  onClear(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAllReceivables(1); // بدون params
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) return;

    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.GroupNumber?.trim())
      params = params.set('GroupNumber', value.GroupNumber.trim());
    if (value.LocationName?.trim())
      params = params.set('LocationName', value.LocationName.trim());
    if (value.fromDate?.trim())
      params = params.set('fromDate', value.fromDate.trim());
    if (value.toDate?.trim())
      params = params.set('toDate', value.toDate.trim());
    this.loadAllReceivables(page, params);
  }

  //اجمع الفلاتر من الـ form
  getFilterParams(): HttpParams {
    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.GroupNumber?.trim())
      params = params.set('GroupNumber', value.GroupNumber.trim());
    if (value.LocationName?.trim())
      params = params.set('LocationName', value.LocationName.trim());
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

    if (
      !this.form.valid ||
      !this.receivable.traderId ||
      !this.receivable.workLocationId
    ) {
      return;
    }

    this.isLoading = true;

    const body = {
      date: this.receivable.date,
      procurementStatement: this.receivable.procurementStatement.trim(),
      total: this.receivable.total,
      notes: this.receivable.notes.trim(),
      workLocationId: this.receivable.workLocationId,
      traderId: this.receivable.traderId,
    };

    try {
      const result = await firstValueFrom(this.apiService.addReceivable(body));

      if (result.success) {
        this.successMessage = 'تم إضافة المقبوض بنجاح';
        this.resetAddForm();
        this.loadAllReceivables(1);
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
    this.receivable = {
      date: '',
      procurementStatement: '',
      total: 0,
      notes: '',
      workLocationId: null,
      traderId: null,
    };
    this.formElement.nativeElement.classList.remove('was-validated');
  }

  // جلب بيانات معدة واحدة للتعديل
  loadReceivableForEdit(id: number) {
    this.Loading = true;
    this.apiService.getReceivableById(id).subscribe({
      next: (res) => {
        const rec = res;
        this.editReceivable = {
          traderName: rec.traderName || '',
          date: rec.date || '',
          procurementStatement: rec.procurementStatement || '',
          total: rec.total || 0,
          notes: rec.notes || '',
          workLocationId: rec.workLocationId || null,
          traderId: rec.traderId || null,
        };
        this.currentEditingReceivableId = id;
        this.showEditModal = true;
        this.cdr.detectChanges();
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading receivables for edit:', err);
        this.errorMessage = 'فشل جلب بيانات المقبوض';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateReceivable() {
    this.editForm.form.markAllAsTouched();
    this.editFormElement.nativeElement.classList.add('was-validated');

    if (!this.editForm.valid) return;

    this.isLoading = true;

    const body = {
      date: this.editReceivable.date,
      procurementStatement: this.editReceivable.procurementStatement.trim(),
      total: this.editReceivable.total,
      notes: this.editReceivable.notes.trim(),
      workLocationId: this.editReceivable.workLocationId!, // ← مهم جدًا
      traderId: this.editReceivable.traderId! || 0,
    };

    try {
      const res = await firstValueFrom(
        this.apiService.updateReceivable(this.currentEditingReceivableId!, body)
      );
      if (res.success) {
        this.successMessage = 'تم التعديل بنجاح';
        this.showEditModal = false;
        this.loadAllReceivables(this.currentPage);
      } else {
        this.errorMessage = res.message || 'فشل التعديل';
      }
    } catch {
      this.errorMessage = 'فشل الاتصال';
    } finally {
      this.isLoading = false;
      setTimeout(() => (this.successMessage = this.errorMessage = null), 3000);
    }
  }

  deletedReceivable(id: number) {
    if (confirm('هل أنت متأكد من  حذف هذا المقبوض؟')) {
      this.Loading = true;
      this.apiService.deleteReceivable(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف المقبوض بنجاح';
          this.loadAllReceivables(this.currentPage);
          setTimeout(() => {
            this.successMessage = null;
            const params = this.getFilterParams(); // نفس الفلاتر
            this.loadAllReceivables(this.currentPage, params); // نفس الصفحة
          }, 2000);
          this.Loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(`خطأ في حذف المقبوض ${id}:`, error);
          this.errorMessage = 'فشل حذف المقبوض';
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
