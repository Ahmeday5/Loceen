import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostBinding,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // إضافة CommonModule
import {
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  Subscription,
} from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule], // إضافة RouterModule لدعم routerLink و routerLinkActive
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  // حالة الـ Sidebar (مفتوحة أو مغلقة)
  isSidebarOpen: boolean = false;

  // الحالة الجديدة: مصغر أو مكبر (للديسكتوب)
  isCollapsed: boolean = false;

  menuItems: any[] = [];
  filteredMenuItems: any[] = [];
  private searchSub: Subscription | null = null;
  @ViewChild('searchInput', { static: true })
  searchInputRef!: ElementRef<HTMLInputElement>;

  @HostBinding('style.--sidebar-width')
  get sidebarWidth(): string {
    if (this.isCollapsed && window.innerWidth >= 993) {
      return '70px';
    }
    return '250px';
  }

  // حقن Router و AuthService
  constructor(private router: Router, private authService: AuthService) {}

  // التهيئة عند تحميل الكومبوننت
  ngOnInit(): void {
    this.updateMenuItems();
    this.updateSidebarState();
    // في البداية العرض يعرض القائمة كلها
    this.filteredMenuItems = JSON.parse(JSON.stringify(this.menuItems));

    // استرجاع حالة التصغير من localStorage (اختياري)
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved) {
      this.isCollapsed = saved === 'true';
    }
  }

  // فتح/قفل الـ Sidebar
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // فتح وإغلاق السايدبار في الموبايل فقط
  toggleMobileSidebar(): void {
    if (window.innerWidth <= 992) {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }

  // تصغير / تكبير الـ Sidebar (للديسكتوب
  toggleCollapse(): void {
    if (window.innerWidth >= 993) {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());

      // إجبار Angular على إعادة حساب الـ layout
      window.dispatchEvent(new Event('resize'));
    }
  }

  // عند الضغط على أي عنصر في القايمة (في الموبايل بس يتقفل)
  onMenuItemClick(): void {
    if (window.innerWidth <= 992) {
      this.isSidebarOpen = false; // إغلاق تلقائي في الموبايل
    }
  }

  // بعد تحميل العرض
  ngAfterViewInit(): void {
    window.addEventListener('resize', () => this.updateSidebarState());

    // اشتراك على أحداث الإدخال مع debounce لتقليل النداءات أثناء الكتابة
    this.searchSub = fromEvent(this.searchInputRef.nativeElement, 'input')
      .pipe(
        map((e: any) => e.target.value as string),
        map((v) => v.trim()),
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        this.applyFilter(query);
      });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  // دالة لتحديد حالة السايدبار بناءً على حجم الشاشة
  private updateSidebarState(): void {
    const isDesktop = window.innerWidth >= 993;
    this.isSidebarOpen = isDesktop ? true : false; // في الديسكتوب دايمًا مفتوح
    if (!isDesktop) {
      this.isCollapsed = false; // الموبايل ما يستخدمش التصغير
    }
  }

  // التحقق إذا كان الرابط نشطًا
  isActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  // دالة لفتح/إغلاق القائمة الفرعية
  toggleSubmenu(sectionIndex: number, itemIndex: number): void {
    const section = this.filteredMenuItems[sectionIndex];
    if (!section || !section.items) return;
    const item = section.items[itemIndex];
    if (!item) return;
    item.isOpen = !item.isOpen;
  }

  /***********************
   * فلترة ذكية للـ menu *
   ***********************/
  private applyFilter(query: string): void {
    if (!query) {
      // لو البحث فاضي، رجع نسخة كاملة من الـ menu الأصلية (وأعد إغلاق القوائم الفرعية)
      this.filteredMenuItems = JSON.parse(JSON.stringify(this.menuItems));
      this.closeAllSubmenus(this.filteredMenuItems);
      return;
    }

    const q = query.toLowerCase();

    // ننتج قائمة جديدة تحتوي فقط الأقسام/عناصر التي تطابق الاستعلام
    const result: any[] = [];

    for (const section of this.menuItems) {
      const clonedSection: any = { ...section };
      // نحتاج نسخة مجمدة من items حتى لا نعدل المصدر الأصلي
      clonedSection.items = [];

      // نتحقق من عنوان القسم نفسه (title) أولاً
      const titleMatches =
        section.title && section.title.toLowerCase().includes(q);

      // لو العنوان يطابق، نعرض كل العناصر داخل هذا القسم
      if (titleMatches) {
        clonedSection.items = JSON.parse(JSON.stringify(section.items || []));
        // نفتح كل العناصر التي تحتوي submenu افتراضياً لكي تظهر النتائج بوضوح
        if (clonedSection.items)
          clonedSection.items.forEach((it: any) => {
            if (it.submenu) it.isOpen = true;
          });
        result.push(clonedSection);
        continue;
      }

      // وإلا نفلتر العناصر داخل القسم
      if (section.items && section.items.length) {
        for (const item of section.items) {
          const itemLabel = (item.label || '').toLowerCase();
          let matchedItem: any = null;

          // تطابق على اسم العنصر
          if (itemLabel.includes(q)) {
            matchedItem = JSON.parse(JSON.stringify(item));
            // لو هو عنصر يحتوي submenu، نفتحها تلقائياً
            if (matchedItem.submenu) matchedItem.isOpen = true;
          } else if (item.submenu && item.submenu.length) {
            // لو لم يطابق اسم العنصر، نبحث داخل الـ submenu
            const matchingSub: any[] = [];
            for (const sub of item.submenu) {
              const subKey = (sub.key || '').toLowerCase();
              if (subKey.includes(q)) {
                matchingSub.push(JSON.parse(JSON.stringify(sub)));
              }
            }
            if (matchingSub.length) {
              // نأخذ نسخة من العنصر ونضع فيها فقط الـ subitems المطابقة ونفتحه
              matchedItem = {
                ...JSON.parse(JSON.stringify(item)),
                submenu: matchingSub,
                isOpen: true,
              };
            }
          }

          if (matchedItem) {
            clonedSection.items.push(matchedItem);
          }
        }

        // لو وجدنا أي عنصر متطابق داخل القسم نضيف القسم
        if (clonedSection.items.length) {
          result.push(clonedSection);
        }
      }
    }

    this.filteredMenuItems = result;
  }

  private closeAllSubmenus(list: any[]): void {
    for (const section of list) {
      if (section.items && section.items.length) {
        for (const it of section.items) {
          if (it.submenu) it.isOpen = false;
        }
      }
    }
  }

  // دالة تسجيل الخروج
  logout(): void {
    this.authService.logout(); // استدعاء دالة logout من AuthService
    this.router.navigate(['/']); // التنقل إلى صفحة تسجيل الدخول
  }

  private updateMenuItems(): void {
    this.menuItems = [
      {
        items: [
          {
            label: 'DashBoard',
            path: '/dashboard',
            icons: 'fa-solid fa-gauge-high',
          },
          {
            label: 'المبيعات',
            icons: 'fa-solid fa-truck-fast',
            submenu: [
              {
                key: 'إدارة المبيعات',
                path: '/add-sale',
                icon: 'fa-solid fa-id-card',
              },
            ],
          },
          {
            label: 'موردين وعاملين',
            icons: 'fa-solid fa-truck-fast',
            submenu: [
              {
                key: 'موردين',
                path: '/Suppliers',
                icon: 'fa-solid fa-id-card',
              },
              {
                key: 'إضافة عامل جديد',
                path: '/add-emp',
                icon: 'fa-solid fa-map-location-dot',
              },
              /*{
                key: 'الاستعلام عن العاملين',
                path: '/inquiry-emp',
                icon: 'fa-solid fa-map-location-dot',
              },*/
            ],
          },
          {
            label: 'المصروفات',
            icons: 'fa-solid fa-rotate-left',
            submenu: [
              {
                key: 'تسجيل المصروفات',
                path: '/Recording-expenses',
                icon: 'fa-solid fa-user-ninja',
              },
            ],
          },
          {
            label: 'المقبوضات',
            icons: 'fa-solid fa-rotate-left',
            submenu: [
              {
                key: 'تسجيل المقبوضات',
                path: '/Recording-Receipts',
                icon: 'fa-solid fa-user-ninja',
              },
            ],
          },
          {
            label: 'عربيات ومعدات',
            icons: 'fa-solid fa-rotate-left',
            submenu: [
              {
                key: 'بيانات المعدة',
                path: '/EquipmentData',
                icon: 'fa-solid fa-user-ninja',
              },
              {
                key: 'العربيات والمعدات',
                path: '/Vehicles-Equipment',
                icon: 'fa-solid fa-user-ninja',
              },
            ],
          },
          {
            label: 'نظام فترة العمل',
            icons: 'fa-solid fa-rotate-left',
            submenu: [
              {
                key: 'فترة العمل',
                path: '/Employee-Advance',
                icon: 'fa-solid fa-user-ninja',
              },
            ],
          },
          {
            label: 'المستخدمين',
            path: '/appUser',
            icons: 'fa-solid fa-gauge-high',
          },
          /*{
            label: 'نظام النسبة',
            icons: 'fa-solid fa-rotate-left',
            submenu: [
              {
                key: 'الاستعلام عن نظام النسب',
                path: '/Inquiry-PercentageSystem',
                icon: 'fa-solid fa-user-ninja',
              },
            ],
          },
          {
            label: 'الماليات',
            icons: 'fa-solid fa-rotate-left',
            submenu: [
              {
                key: 'تسجيل المصروفات',
                path: '/order-return',
                icon: 'fa-solid fa-user-ninja',
              },
              {
                key: 'الاستعلام عن المصروفات',
                path: '/order-return',
                icon: 'fa-solid fa-user-ninja',
              },
            ],
          },
          {
            label: 'الاستعلامات',
            icons: 'fa-solid fa-rotate-left',
            submenu: [
              {
                key: 'الاستعلام عن المعدة',
                path: '/Inquir-Equipment',
                icon: 'fa-solid fa-user-ninja',
              },
              {
                key: 'الاستعلام عن حساب العمال',
                path: '/Inquiry-EmployeeAccounts',
                icon: 'fa-solid fa-user-ninja',
              },
            ],
          },
          {
            label: 'الايجارات',
            icons: 'fa-solid fa-rotate-left',
            submenu: [
              {
                key: 'تسجيل المصروفات',
                path: '/order-return',
                icon: 'fa-solid fa-user-ninja',
              },
              {
                key: 'الاستعلام عن المصروفات',
                path: '/order-return',
                icon: 'fa-solid fa-user-ninja',
              },
            ],
          },
          {
            label: 'الضبط',
            path: '/Settings',
            icons: 'fa-solid fa-gauge-high',
          },*/
        ],
      },
    ];
  }
}
