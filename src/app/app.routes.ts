import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const canActivate: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    map((isLoggedIn) => {
      if (isLoggedIn) {
        return true; // مسجل → خليه يكمل
      } else {
        return router.createUrlTree(['/']); // مش مسجل → ارجع على اللوجن (الـ root)
      }
    })
  );
};

export const canActivateRole: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['allowedRoles'] as string[]) || [];

  return authService.role$.pipe(
    map((role) => {
      if (!role || !allowedRoles.some((r) => role.includes(r))) {
        return router.createUrlTree(['dashboard']);
      }
      return true;
    })
  );
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'تسجيل الدخول',
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        return authService.isLoggedIn$.pipe(
          map((isLoggedIn) =>
            isLoggedIn ? router.createUrlTree(['/dashboard']) : true
          )
        );
      },
    ],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    title: 'اللوحة الرئيسية',
    canActivate: [canActivate],
  },
  {
    path: 'add-sale',
    loadComponent: () =>
      import('./components/sales/add-sale/add-sale.component').then(
        (m) => m.AddSaleComponent
      ),
    title: 'إضافة مبيع',
  },
  {
    path: 'Sales-Inquiry',
    loadComponent: () =>
      import('./components/sales/sales-inquiry/sales-inquiry.component').then(
        (m) => m.SalesInquiryComponent
      ),
    title: 'استعلام عن المبيعات',
  },
  {
    path: 'add-emp',
    loadComponent: () =>
      import(
        './components/suppliersAndEmployees/add-employee/add-employee.component'
      ).then((m) => m.AddEmployeeComponent),
    title: 'إضافة عامل جديد',
  },
  {
    path: 'inquiry-emp',
    loadComponent: () =>
      import(
        './components/suppliersAndEmployees/inquiry-employees/inquiry-employees.component'
      ).then((m) => m.InquiryEmployeesComponent),
    title: 'الاستعلام عن العاملين',
  },
  {
    path: 'Suppliers',
    loadComponent: () =>
      import(
        './components/suppliersAndEmployees/suppliers/suppliers.component'
      ).then((m) => m.SuppliersComponent),
    title: 'المورين',
  },
  {
    path: 'Recording-Receipts',
    loadComponent: () =>
      import(
        './components/recording-receipts/recording-receipts.component'
      ).then((m) => m.RecordingReceiptsComponent),
    title: 'المقبوضات',
  },
  {
    path: 'Recording-expenses',
    loadComponent: () =>
      import(
        './components/recording-expenses/recording-expenses.component'
      ).then((m) => m.RecordingExpensesComponent),
    title: 'المصروفات',
  },
  {
    path: 'Vehicles-Equipment',
    loadComponent: () =>
      import(
        './components/vehicles-and-equipment/vehicles-and-equipment.component'
      ).then((m) => m.VehiclesAndEquipmentComponent),
    children: [
      {
        path: 'Working-Hours',
        loadComponent: () =>
          import(
            './components/vehicles-and-equipment/working-hours/working-hours.component'
          ).then((m) => m.WorkingHoursComponent),
        title: 'ساعات العمل',
      },
      {
        path: 'Transfers',
        loadComponent: () =>
          import(
            './components/vehicles-and-equipment/transfers/transfers.component'
          ).then((m) => m.TransfersComponent),
        title: 'نقلات',
      },
      {
        path: 'Inquiry-equ-veh',
        loadComponent: () =>
          import(
            './components/vehicles-and-equipment/inquiry-equipment-orvehicles/inquiry-equipment-orvehicles.component'
          ).then((m) => m.InquiryEquipmentORvehiclesComponent),
        title: 'الاستعلام عن المعدات والعربات',
      },
      //{ path: '', redirectTo: 'Working-Hours', pathMatch: 'full' },
    ],
  },
  {
    path: 'Salaries-System',
    loadComponent: () =>
      import('./components/salaries-system/salaries-system.component').then(
        (m) => m.SalariesSystemComponent
      ),
    children: [
      {
        path: 'Recording-WorkingHours',
        loadComponent: () =>
          import(
            './components/salaries-system/recording-working/recording-working.component'
          ).then((m) => m.RecordingWorkingComponent),
        title: 'تسجيل فترة العمل',
      },
      {
        path: 'Inquire-EmployeeAccounts',
        loadComponent: () =>
          import(
            './components/salaries-system/inquire-employee-accounts/inquire-employee-accounts.component'
          ).then((m) => m.InquireEmployeeAccountsComponent),
        title: 'الاستعلام عن حسابات العاملين',
      },
      //{ path: '', redirectTo: 'Working-Hours', pathMatch: 'full' },
    ],
  },
  {
    path: 'Employee-Advance',
    loadComponent: () =>
      import(
        './components/EmployeeAdvance/employee-advance/employee-advance.component'
      ).then((m) => m.EmployeeAdvanceComponent),
    title: 'فترة العمل',
  },
  {
    path: 'Inquir-Equipment',
    loadComponent: () =>
      import(
        './components/Inquiries/inquiry-equipment/inquiry-equipment.component'
      ).then((m) => m.InquiryEquipmentComponent),
    title: 'الاستعلام عن المعدة',
  },
  {
    path: 'EquipmentData',
    loadComponent: () =>
      import(
        './components/vehicles-and-equipment/equipment-data/equipment-data.component'
      ).then((m) => m.EquipmentDataComponent),
    title: 'بيانات المعدة',
  },
  {
    path: 'Inquiry-EmployeeAccounts',
    loadComponent: () =>
      import(
        './components/Inquiries/inquiry-about-employee-eccounts/inquiry-about-employee-eccounts.component'
      ).then((m) => m.InquiryAboutEmployeeEccountsComponent),
    title: 'الاستعلام عن حساب العمال',
  },
  {
    path: 'appUser',
    loadComponent: () =>
      import('./components/app-user/app-user.component').then(
        (m) => m.AppUserComponent
      ),
    title: 'الاستعلام عن حساب العمال',
  },
  {
    path: 'Inquiry-PercentageSystem',
    loadComponent: () =>
      import(
        './components/percentageSystem/inquiry-percentage-system/inquiry-percentage-system.component'
      ).then((m) => m.InquiryPercentageSystemComponent),
    title: 'الاستعلام عن نظام النسب',
  },
  {
    path: 'Settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
    title: 'الضبط',
    children: [
      {
        path: 'AllSettings',
        loadComponent: () =>
          import(
            './components/settings/all-settings/all-settings.component'
          ).then((m) => m.AllSettingsComponent),
        title: 'الاعدادت',
      },
      {
        path: 'PasswordManage',
        loadComponent: () =>
          import(
            './components/settings/password-manage/password-manage.component'
          ).then((m) => m.PasswordManageComponent),
        title: 'ادارة كلمات المرور',
      },
      {
        path: 'Notifications',
        loadComponent: () =>
          import(
            './components/settings/notifications/notifications.component'
          ).then((m) => m.NotificationsComponent),
        title: 'الاشعارات',
      },
      {
        path: 'DeleteAccount',
        loadComponent: () =>
          import(
            './components/settings/delete-account/delete-account.component'
          ).then((m) => m.DeleteAccountComponent),
        title: 'حذف الحساب',
      },
      //{ path: '', redirectTo: 'Working-Hours', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
