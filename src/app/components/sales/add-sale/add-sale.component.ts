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
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../../layout/pagination/pagination.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { allSold } from '../../../types/solds.type';
import { TraderForSelection } from '../../../types/expense.type';

@Component({
  selector: 'app-add-sale',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './add-sale.component.html',
  styleUrl: './add-sale.component.scss',
})
export class AddSaleComponent implements OnInit {
  allTraders: TraderForSelection[] = [];
  //table
  allSolds: allSold[] = [];
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

  sold = {
    weight: 0,
    price: 0,
    soldDate: '',
    notes: '',
    traderId: null as number | null,
  };

  //edit
  // للتحكم في مودال التعديل
  showEditModal = false;
  currentEditingSoldId: number | null = null; // ID الموظف اللي بنعدله

  editSold = {
    weight: 0,
    price: 0,
    soldDate: '',
    notes: '',
    traderId: null as number | null,
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      TraderName: [''],
      fromDate: [''],
      toDate: [''],
    });
  }

  ngOnInit(): void {
    this.loadAllSolds(1);
    this.loadTradersForDropdown();

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

  //ger all Equipment
  loadAllSolds(page: number, params: HttpParams = new HttpParams()): void {
    this.Loading = true;
    this.currentPage = page;

    // نضيف الـ pagination دايمًا
    params = params.set('page', page.toString());
    params = params.set('pageSize', this.pageSize.toString());

    this.apiService.getAllSolds(params).subscribe({
      next: (res) => {
        this.allSolds = res.data?.data || [];
        this.totalCount = res.data?.totalCount || 0;
        this.totalPages = res.data?.totalPages || 1;
        this.currentPage = res.data?.pageNumber || page;
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading AllSolds:', err);
        this.allSolds = [];
        this.Loading = false;
      },
    });
  }

  private applyFilter(): void {
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.TraderName?.trim()) {
      params = params.set('TraderName', value.TraderName.trim()); // lowercase زي الـ API
    }
    if (value.fromDate?.trim()) {
      params = params.set('fromDate', value.fromDate.trim());
    }
    if (value.toDate?.trim()) {
      params = params.set('toDate', value.toDate.trim());
    }

    this.loadAllSolds(1, params);
  }

  onFilter(): void {
    this.currentPage = 1;
    let params = new HttpParams();

    const value = this.filterForm.value;

    if (value.TraderName?.trim())
      params = params.set('TraderName', value.TraderName.trim());
    if (value.fromDate?.trim())
      params = params.set('fromDate', value.fromDate.trim());
    if (value.toDate?.trim())
      params = params.set('toDate', value.toDate.trim());
    this.loadAllSolds(1, params);
  }

  onClear(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAllSolds(1); // بدون params
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) return;

    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.TraderName?.trim())
      params = params.set('TraderName', value.TraderName.trim());
    if (value.fromDate?.trim())
      params = params.set('fromDate', value.fromDate.trim());
    if (value.toDate?.trim())
      params = params.set('toDate', value.toDate.trim());
    this.loadAllSolds(page, params);
  }

  //اجمع الفلاتر من الـ form
  getFilterParams(): HttpParams {
    let params = new HttpParams();
    const value = this.filterForm.value;

    if (value.TraderName?.trim())
      params = params.set('TraderName', value.TraderName.trim());
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

    if (!this.form.valid || !this.sold.traderId) {
      return;
    }

    this.isLoading = true;

    const body = {
      soldDate: this.sold.soldDate.trim(),
      weight: this.sold.weight,
      price: this.sold.price,
      notes: this.sold.notes.trim(),
      traderId: this.sold.traderId,
    };

    try {
      const res = await firstValueFrom(this.apiService.addSold(body));
      if (res.success) {
        this.successMessage = 'تم إضافة المبيع بنجاح';
        this.resetAddForm();
        this.loadAllSolds(1);
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
    this.sold = {
      soldDate: '',
      weight: 0,
      price: 0,
      notes: '',
      traderId: null,
    };
    this.formElement.nativeElement.classList.remove('was-validated');
  }

  // جلب بيانات معدة واحدة للتعديل
  loadSoldForEdit(id: number): void {
    this.Loading = true;

    this.apiService.getSoldById(id).subscribe({
      next: (res) => {
        const sold = res;
        // نملأ البيانات في editSold
        this.editSold = {
          soldDate: sold.soldDate || '',
          weight: sold.weight || 0,
          price: sold.price || 0,
          notes: sold.notes || '',
          traderId: sold.traderId || null,
        };

        this.currentEditingSoldId = id;
        this.showEditModal = true;
        this.cdr.detectChanges();
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading solds for edit:', err);
        this.errorMessage = 'فشل جلب بيانات المبيع للتعديل';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateSold(): Promise<void> {
    this.editForm.form.markAllAsTouched();
    this.editFormElement.nativeElement.classList.add('was-validated');

    if (!this.editForm.valid) return;

    this.isLoading = true;

    const body = {
      soldDate: this.editSold.soldDate.trim(),
      weight: this.editSold.weight,
      price: this.editSold.price,
      notes: this.editSold.notes.trim(),
      traderId: Number(this.editSold.traderId),
    };

    try {
      const result = await firstValueFrom(
        this.apiService.updateSold(this.currentEditingSoldId!, body)
      );

      if (result.success) {
        this.successMessage = 'تم تعديل بيانات المبيع بنجاح ✓';
        this.showEditModal = false;
        this.loadAllSolds(this.currentPage); // تحديث الجدول
      } else {
        this.errorMessage = result.message || 'حدث خطأ أثناء التعديل';
      }
    } catch (err: any) {
      this.errorMessage = 'فشل الاتصال بالخادم';
    } finally {
      this.isLoading = false;
      setTimeout(() => (this.successMessage = this.errorMessage = null), 3000);
    }
  }

  deletedSold(id: number) {
    if (confirm('هل أنت متأكد من  حذف هذا المبيع؟')) {
      this.Loading = true;
      this.apiService.deleteSold(id).subscribe({
        next: () => {
          this.successMessage = 'تم حذف المبيع بنجاح';
          setTimeout(() => {
            this.successMessage = null;
            const params = this.getFilterParams(); // نفس الفلاتر
            this.loadAllSolds(this.currentPage, params); // نفس الصفحة
          }, 2000);
          this.Loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(`خطأ في حذف المبيع ${id}:`, error);
          this.errorMessage = 'فشل حذف المبيع';
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
