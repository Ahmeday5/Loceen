import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpParams } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../layout/pagination/pagination.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  allExpenses,
  ExpensesResponse,
  TradersDropdownResponse,
  TraderForSelection,
} from '../../types/expense.type';
import { allWorkLocations } from '../../types/employee.type';

@Component({
  selector: 'app-recording-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './recording-expenses.component.html',
  styleUrl: './recording-expenses.component.scss',
})
export class RecordingExpensesComponent implements OnInit {
  allTraders: TraderForSelection[] = [];
  allExpense: allExpenses[] = [];
  //getWorkLocation
  allWorkLocations: allWorkLocations[] = [];
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;
  showFilter = false;
  filterForm: FormGroup;

  @ViewChild('form') form!: NgForm;
  @ViewChild('form', { static: false, read: ElementRef })
  formElement!: ElementRef<HTMLFormElement>;

  @ViewChild('editForm') editForm!: NgForm;
  @ViewChild('editForm', { static: false, read: ElementRef })
  editFormElement!: ElementRef<HTMLFormElement>;

  isLoading = false;
  Loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  expense = {
    date: '',
    procurementStatement: '',
    total: 0,
    notes: '',
    workLocationId: null as number | null,
    traderId: null as number | null,
  };

  showEditModal = false;
  currentEditingExpenseId: number | null = null;

  editExpense = {
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
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      traderName: [''],
      locationName: [''],
      groupNumber: [''],
      fromDate: [''],
      toDate: [''],
    });
  }

  ngOnInit(): void {
    this.loadAllExpenses(1);
    this.loadTradersForDropdown();
    this.loadAllWorkLocations();

    this.filterForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
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

  loadAllExpenses(page: number, params: HttpParams = new HttpParams()) {
    this.Loading = true;
    this.currentPage = page;

    params = params
      .set('page', page.toString())
      .set('pageSize', this.pageSize.toString());

    this.apiService.getAllExpenses(params).subscribe({
      next: (res: ExpensesResponse) => {
        this.allExpense = res.data?.data || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.currentPage = res.data?.pageNumber || page;
        this.Loading = false;
      },
      error: () => {
        this.allExpense = [];
        this.Loading = false;
      },
    });
  }

  private applyFilter() {
    let params = new HttpParams();
    const val = this.filterForm.value;

    if (val.traderName?.trim())
      params = params.set('traderName', val.traderName.trim());
    if (val.locationName?.trim())
      params = params.set('locationName', val.locationName.trim());
    if (val.groupNumber) params = params.set('groupNumber', val.groupNumber);
    if (val.fromDate) params = params.set('fromDate', val.fromDate);
    if (val.toDate) params = params.set('toDate', val.toDate);

    this.loadAllExpenses(1, params);
  }

  onClear() {
    this.filterForm.reset();
    this.loadAllExpenses(1);
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  onPageChange(page: number) {
    if (page === this.currentPage) return;
    const params = this.getFilterParams();
    this.loadAllExpenses(page, params);
  }

  getFilterParams(): HttpParams {
    let params = new HttpParams();
    const val = this.filterForm.value;

    if (val.traderName?.trim())
      params = params.set('traderName', val.traderName.trim());
    if (val.locationName?.trim())
      params = params.set('locationName', val.locationName.trim());
    if (val.groupNumber) params = params.set('groupNumber', val.groupNumber);
    if (val.fromDate) params = params.set('fromDate', val.fromDate);
    if (val.toDate) params = params.set('toDate', val.toDate);

    return params;
  }

  async handleSubmit() {
    this.form.form.markAllAsTouched();
    this.formElement.nativeElement.classList.add('was-validated');

    if (
      !this.form.valid ||
      !this.expense.traderId ||
      !this.expense.workLocationId
    ) {
      return;
    }

    this.isLoading = true;

    const body = {
      date: this.expense.date,
      procurementStatement: this.expense.procurementStatement.trim(),
      total: this.expense.total,
      notes: this.expense.notes.trim(),
      workLocationId: this.expense.workLocationId,
      traderId: this.expense.traderId,
    };

    try {
      const res = await firstValueFrom(this.apiService.addExpense(body));
      if (res.success) {
        this.successMessage = 'تم إضافة المصروف بنجاح';
        this.resetAddForm();
        this.loadAllExpenses(1);
      } else {
        this.errorMessage = res.message || 'حدث خطأ';
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
    this.expense = {
      date: '',
      procurementStatement: '',
      total: 0,
      notes: '',
      workLocationId: null,
      traderId: null,
    };
    this.formElement.nativeElement.classList.remove('was-validated');
  }

  loadExpenseForEdit(id: number) {
    this.Loading = true;
    this.apiService.getExpenseById(id).subscribe({
      next: (res) => {
        const exp = res;
        this.editExpense = {
          traderName: exp.traderName || '',
          date: exp.date || '',
          procurementStatement: exp.procurementStatement || '',
          total: exp.total || 0,
          notes: exp.notes || '',
          workLocationId: exp.workLocationId || null,
          traderId: exp.traderId || null,
        };
        this.currentEditingExpenseId = id;
        this.showEditModal = true;
        this.cdr.detectChanges();
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading receivables for edit:', err);
        this.errorMessage = 'فشل جلب بيانات المصروف';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateExpense() {
    this.editForm.form.markAllAsTouched();
    this.editFormElement.nativeElement.classList.add('was-validated');

    if (!this.editForm.valid) return;

    this.isLoading = true;

    const body = {
      date: this.editExpense.date,
      procurementStatement: this.editExpense.procurementStatement.trim(),
      total: this.editExpense.total,
      notes: this.editExpense.notes.trim(),
      workLocationId: this.editExpense.workLocationId!, // ← مهم جدًا
      traderId: this.editExpense.traderId! || 0,
    };

    try {
      const res = await firstValueFrom(
        this.apiService.updateExpense(this.currentEditingExpenseId!, body)
      );
      if (res.success) {
        this.successMessage = 'تم التعديل بنجاح';
        this.showEditModal = false;
        this.loadAllExpenses(this.currentPage);
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

  deletedExpense(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;

    this.Loading = true;
    this.apiService.deleteExpense(id).subscribe({
      next: () => {
        this.successMessage = 'تم الحذف بنجاح';
        this.loadAllExpenses(this.currentPage);
        setTimeout(() => {
          this.successMessage = null;
          const params = this.getFilterParams(); // نفس الفلاتر
          this.loadAllExpenses(this.currentPage, params); // نفس الصفحة
        }, 2000);
        this.Loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`خطأ في حذف المصروف ${id}:`, error);
        this.errorMessage = 'فشل حذف المصروف';
        this.Loading = false;
        setTimeout(() => {
          this.errorMessage = null;
        }, 2000);
        this.cdr.detectChanges();
      },
    });
  }
}
