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
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { allAppUser } from '../../types/AppUser.type';

@Component({
  selector: 'app-app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './app-user.component.html',
  styleUrl: './app-user.component.scss',
})
export class AppUserComponent implements OnInit {
  //table
  allAppUser: allAppUser[] = [];

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

  appUser: {
    email: string;
    password: string;
    role: string;
  } = {
    email: '',
    password: '',
    role: '',
  };

  //edit
  // للتحكم في مودال التعديل
  showEditModal = false;
  currentEditingAppUserId: string | null = null; // ID الموظف اللي بنعدله

  editAppUser: {
    email: string;
    role: string;
  } = {
    email: '',
    role: '',
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadAllAppUser();
  }

  //ger all AppUsers
  loadAllAppUser(): void {
    this.Loading = true;

    this.apiService.getAllAppUser().subscribe({
      next: (res) => {
        this.allAppUser = res.data;
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading allAppUser:', err);
        this.allAppUser = [];
        this.Loading = false;
      },
    });
  }

  //add Sold form submit
  async handleSubmit(): Promise<void> {
    // السطرين دول هما السحر: بيخلوا كل الحقول تُعتبر "ملموسة" ويظهر الأخطاء فورًا
    this.form.form.markAllAsTouched(); // <--- مهم جدًا
    this.formElement.nativeElement.classList.add('was-validated'); // <--- ده لـ Bootstrap

    if (!this.form.valid) {
      // لو الفورم مش صح، وقف هنا ومتكملش
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      email: this.appUser.email.trim(),
      password: this.appUser.password.trim(),
      role: this.appUser.role.trim(),
    };

    try {
      const result = await firstValueFrom(this.apiService.addAppUser(body));
      // result دايمًا هيبقى object فيه success و message
      if (result.success) {
        this.successMessage = 'تم إضافة المستخدم بنجاح ✓';
        this.form.resetForm();
        this.appUser.email = '';
        this.appUser.password = '';
        this.appUser.role = '';
        this.formElement.nativeElement.classList.remove('was-validated');
        setTimeout(() => (this.successMessage = null), 2000);
        this.loadAllAppUser(); // تحديث الجدول
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

  // جلب بيانات سلفة واحدة للتعديل
  loadAppUserForEdit(id: string): void {
    this.Loading = true;

    this.apiService.getAppUserById(id).subscribe({
      next: (res) => {
        // ✅ res هو المستخدم نفسه
        if (!res) {
          this.errorMessage = 'لم يتم العثور على المستخدم';
          return;
        }

        this.editAppUser = {
          email: res.email,
          role: res.roles?.[0] ?? '',
        };

        this.currentEditingAppUserId = id;
        this.showEditModal = true;
        this.Loading = false;
      },
      error: (err) => {
        console.error('Error loading AppUser for edit:', err);
        this.errorMessage = 'فشل جلب بيانات المستخدم';
        this.Loading = false;
      },
    });
  }

  async handleUpdateAppUser(): Promise<void> {
    // السطرين دول هما السحر: بيخلوا كل الحقول تُعتبر "ملموسة" ويظهر الأخطاء فورًا
    this.editForm.form.markAllAsTouched();
    this.editFormElement.nativeElement.classList.add('was-validated');

    if (!this.editForm.valid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      email: this.editAppUser.email.trim(),
      password: '',
      role: this.editAppUser.role.trim(),
    };

    try {
      const result = await firstValueFrom(
        this.apiService.updateAppUser(this.currentEditingAppUserId!, body)
      );

      if (result.success) {
        this.successMessage = 'تم تعديل بيانات المستخدم بنجاح ✓';
        this.showEditModal = false;
        this.loadAllAppUser(); // تحديث الجدول
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
}
