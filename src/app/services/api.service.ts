import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { LoginCredentials, LoginResponse } from '../types/login.type';
import { StakeholdersResponse } from '../types/stackhoder.type';
import {
  allWorkLocationsResponse,
  EmployeesResponse,
} from '../types/employee.type';
import { EquipmentsResponse } from '../types/equipment.type';
import { SoldResponse } from '../types/solds.type';
import { ReceivablesResponse } from '../types/receivable.type';
import {
  ExpensesResponse,
  TraderForSelection,
  TradersDropdownResponse,
} from '../types/expense.type';
import { WorkHoursResponse } from '../types/WorkHours.type';
import {
  EquipmentForSelection,
  RegisterTransfersResponse,
} from '../types/RegisterTransfers.type';
import {
  employeesForSelection,
  workingperiodsResponse,
} from '../types/employeeAdvance.type';
import { AppUsersResponse } from '../types/AppUser.type';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://loceenv2.runasp.net';

  constructor(private http: HttpClient) {}

  /***********************************login********************************************/

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const loginUrl = `${this.baseUrl}/api/Dashboard/login`;

    return this.http.post<LoginResponse>(loginUrl, credentials).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'حدث خطأ غير معروف';
        if (error.status === 0) {
          errorMessage = 'فشل الاتصال بالخادم. تحقق من الشبكة.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'بيانات الإدخال غير صحيحة.';
        } else if (error.status === 401) {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        } else if (error.status === 503) {
          errorMessage = 'الخادم غير متاح حاليًا. حاول لاحقًا.';
        }
        console.error('خطأ في تسجيل الدخول:', error);
        return throwError(() => ({
          status: error.status,
          message: errorMessage,
        }));
      })
    );
  }

  /*****************************************stackholder**************************************************/
  // addStakeholder
  addStakeholder(body: {
    name: string;
    address: string;
    phone: string;
    accountNumber: string;
    activityType: string;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/traders`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة التاجر بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل إضافة التاجر';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في إضافة التاجر:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // get all stakeholders
  getAllStakeholders(params?: HttpParams): Observable<StakeholdersResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/traders`;

    return this.http.get<StakeholdersResponse>(url, { headers, params }).pipe(
      map(
        (res: StakeholdersResponse) =>
          res || {
            data: {
              data: [],
              pagination: {
                currentPage: 1,
                pageSize: 10,
                totalCount: 0,
                totalPages: 1,
              },
            },
          }
      ),
      catchError((err) => {
        console.error('Error fetching stakeholder:', err);
        return of({
          data: {
            data: [],
            pagination: {
              currentPage: 1,
              pageSize: 10,
              totalCount: 0,
              totalPages: 1,
            },
          },
        });
      })
    );
  }

  // جلب موظف واحد
  getStackholderById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/traders/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching stakeholder by id:', err);
        return of({ data: {} });
      })
    );
  }

  // تعديل موظف
  updateStackholder(
    id: number,
    body: {
      name: string;
      address: string;
      phone: string;
      accountNumber: string;
      activityType: string;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/traders/${id}`;

    return this.http
      .put(url, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((textResponse: string) => ({
          success: true,
          message: textResponse.trim() || 'تم تعديل التاجر بنجاح',
        })),
        catchError((error) => {
          let msg = 'فشل تعديل التاجر';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          }
          return of({ success: false, message: msg });
        })
      );
  }

  // delete stakeholder
  deletetStackholder(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token : 'No token found');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/api/Dashboard/traders/${id}`;
    return this.http
      .delete<string>(url, { headers, responseType: 'text' as 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حذف التاجر ${id}:`, error);
          let errorMessage = `فشل حذف التاجر ${id}`;
          if (error.status === 401) {
            errorMessage = 'غير مصرح. تحقق من الـ token أو الصلاحيات.';
          } else if (error.status === 400) {
            errorMessage = 'طلب غير صالح. تحقق من بيانات الطلب.';
          } else if (error.status === 404) {
            errorMessage = 'التاجر غير موجود.';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /*****************************************employee**************************************************/
  // addemployee
  addEmployee(body: {
    name: string;
    workSystem: string;
    accountNumber: string;
    phone: string;
    notes: string;
    workLocationId: number;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/employees`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نتعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة العامل بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل إضافة العامل';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في إضافة العامل:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // get allEmployees
  getAllEmployees(params?: HttpParams): Observable<EmployeesResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/employees`;

    return this.http.get<EmployeesResponse>(url, { headers, params }).pipe(
      map(
        (res: EmployeesResponse) =>
          res || {
            data: {
              data: [],
              pagination: {
                currentPage: 1,
                pageSize: 10,
                totalCount: 0,
                totalPages: 1,
              },
            },
          }
      ),
      catchError((err) => {
        console.error('Error fetching Employees:', err);
        return of({
          data: {
            data: [],
            pagination: {
              currentPage: 1,
              pageSize: 10,
              totalCount: 0,
              totalPages: 1,
            },
          },
        });
      })
    );
  }

  // جلب موظف واحد
  getEmployeeById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/employees/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching employee by id:', err);
        return of({ data: {} });
      })
    );
  }

  // تعديل موظف
  updateEmployee(
    id: number,
    body: {
      name: string;
      workSystem: string;
      accountNumber: string;
      phone: string;
      notes: string;
      workLocationId: number;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/employees/${id}`;

    return this.http
      .put(url, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((textResponse: string) => ({
          success: true,
          message: textResponse.trim() || 'تم تعديل العامل بنجاح',
        })),
        catchError((error) => {
          let msg = 'فشل تعديل العامل';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          }
          return of({ success: false, message: msg });
        })
      );
  }

  // delete employee
  deleteEmployee(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token : 'No token found');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/api/Dashboard/employees/${id}`;
    return this.http
      .delete<string>(url, { headers, responseType: 'text' as 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حذف العامل ${id}:`, error);
          let errorMessage = `فشل حذف العامل ${id}`;
          if (error.status === 401) {
            errorMessage = 'غير مصرح. تحقق من الـ token أو الصلاحيات.';
          } else if (error.status === 400) {
            errorMessage = 'طلب غير صالح. تحقق من بيانات الطلب.';
          } else if (error.status === 404) {
            errorMessage = 'العامل غير موجود.';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // get all WorkLocationsResponse
  getAllWorkLocations(): Observable<allWorkLocationsResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/worklocations`;

    return this.http.get<allWorkLocationsResponse>(url, { headers }).pipe(
      map((res) => res || { data: [] }),
      catchError((err) => {
        console.error('Error fetching work locations:', err);
        return of({ data: [] });
      })
    );
  }

  // addworklocation
  addWorkLocation(body: {
    name: string;
    groupNumber: number;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/worklocations`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نتعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة موقع العمل بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل إضافة موقع العمل';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في إضافة موقع العمل:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // delete work location
  deleteWorkLocation(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token : 'No token found');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/api/Dashboard/worklocations/${id}`;
    return this.http
      .delete<string>(url, { headers, responseType: 'text' as 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حذف الموقع ${id}:`, error);
          let errorMessage = `فشل حذف الموقع ${id}`;
          if (error.status === 401) {
            errorMessage = 'غير مصرح. تحقق من الـ token أو الصلاحيات.';
          } else if (error.status === 400) {
            errorMessage = 'طلب غير صالح. تحقق من بيانات الطلب.';
          } else if (error.status === 404) {
            errorMessage = 'الموقع غير موجود.';
          } else if (error.status === 500) {
            errorMessage = 'لا يمكن حذف الموقع لأنه مرتبط بموظفين';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /*****************************************Equipment********************************************************/
  // addEquipment
  addEquipment(body: {
    equipmentNumber: string;
    equipmentType: string;
    workSystem: string;
    equipmentOwnerName: string;
    equipmentOwnerPhone: string;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/equipments`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة المعدة بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل إضافة المعدة';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في إضافة المعدة:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // get all Equipment
  getAllEquipment(params?: HttpParams): Observable<EquipmentsResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/equipments`;

    return this.http.get<EquipmentsResponse>(url, { headers, params }).pipe(
      map(
        (res: EquipmentsResponse) =>
          res || {
            data: {
              data: [],
              pagination: {
                currentPage: 1,
                pageSize: 10,
                totalCount: 0,
                totalPages: 1,
              },
            },
          }
      ),
      catchError((err) => {
        console.error('Error fetching Equipments:', err);
        return of({
          data: {
            data: [],
            pagination: {
              currentPage: 1,
              pageSize: 10,
              totalCount: 0,
              totalPages: 1,
            },
          },
        });
      })
    );
  }

  // جلب معدة واحدة
  getEquipmentById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/equipments/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching equipment by id:', err);
        return of({ data: {} });
      })
    );
  }

  // تعديل معدة
  updateEquipment(
    id: number,
    body: {
      equipmentNumber: string;
      equipmentType: string;
      workSystem: string;
      equipmentOwnerName: string;
      equipmentOwnerPhone: string;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/equipments/${id}`;

    return this.http
      .put(url, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((textResponse: string) => ({
          success: true,
          message: textResponse.trim() || 'تم تعديل المعدة بنجاح',
        })),
        catchError((error) => {
          let msg = 'فشل تعديل المعدة';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          }
          return of({ success: false, message: msg });
        })
      );
  }

  // delete equipment
  deleteEquipment(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token : 'No token found');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/api/Dashboard/equipments/${id}`;
    return this.http
      .delete<string>(url, { headers, responseType: 'text' as 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حذف المعدة ${id}:`, error);
          let errorMessage = `فشل حذف المعدة ${id}`;
          if (error.status === 401) {
            errorMessage = 'غير مصرح. تحقق من الـ token أو الصلاحيات.';
          } else if (error.status === 400) {
            errorMessage = 'طلب غير صالح. تحقق من بيانات الطلب.';
          } else if (error.status === 404) {
            errorMessage = 'التاجر/المورد غير موجود.';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /*****************************************Sold********************************************************/
  // addSold
  addSold(body: {
    soldDate: string;
    weight: number;
    price: number;
    notes: string;
    traderId: number | null;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/sold`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة المبيع بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل المبيع';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في المبيع:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // get all Solds
  getAllSolds(params?: HttpParams): Observable<SoldResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/sold`;

    return this.http.get<SoldResponse>(url, { headers, params }).pipe(
      catchError(() =>
        of({
          data: {
            data: [],
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 1,
          },
        })
      )
    );
  }

  // جلب مبيع واحدة
  getSoldById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/sold/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching sold by id:', err);
        return of({ data: {} });
      })
    );
  }

  // تعديل مبيع
  updateSold(
    id: number,
    body: {
      soldDate: string;
      weight: number;
      price: number;
      notes: string;
      traderId: number;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http
      .put(`${this.baseUrl}/api/Dashboard/sold/${id}`, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((text: string) => ({
          success: true,
          message: text.trim() || 'تم تعديل المبيع بنجاح',
        })),
        catchError((err) => of({ success: false, message: 'فشل التعديل' }))
      );
  }

  // delete sold
  deleteSold(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token : 'No token found');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/api/Dashboard/sold/${id}`;
    return this.http
      .delete<string>(url, { headers, responseType: 'text' as 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حذف المبيع ${id}:`, error);
          let errorMessage = `فشل حذف المبيع ${id}`;
          if (error.status === 401) {
            errorMessage = 'غير مصرح. تحقق من الـ token أو الصلاحيات.';
          } else if (error.status === 400) {
            errorMessage = 'طلب غير صالح. تحقق من بيانات الطلب.';
          } else if (error.status === 404) {
            errorMessage = 'المبيع غير موجود.';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /*****************************************Receivable********************************************************/
  // addReceivable
  addReceivable(body: {
    date: string;
    procurementStatement: string;
    total: number;
    notes: string;
    workLocationId: number;
    traderId: number;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/receivables`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نتعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة المقبوض بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل المقبوض';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في المقبوض:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // get all Receivables
  getAllReceivables(params?: HttpParams): Observable<ReceivablesResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/receivables`;

    return this.http.get<ReceivablesResponse>(url, { headers, params }).pipe(
      catchError(() =>
        of({
          data: {
            data: [],
            grandTotal: 0,
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 1,
          },
        })
      )
    );
  }

  // جلب مقبوض واحد
  getReceivableById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http
      .get(`${this.baseUrl}/api/Dashboard/receivables/${id}`, { headers })
      .pipe(catchError(() => of({ data: {} })));
  }

  // تعديل مقبوض
  updateReceivable(
    id: number,
    body: {
      date: string;
      procurementStatement: string;
      total: number;
      notes: string;
      workLocationId: number;
      traderId: number;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http
      .put(`${this.baseUrl}/api/Dashboard/receivables/${id}`, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((text: string) => ({
          success: true,
          message: text.trim() || 'تم تعديل المقبوض بنجاح',
        })),
        catchError((err) => of({ success: false, message: 'فشل التعديل' }))
      );
  }

  // delete receivable
  deleteReceivable(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token : 'No token found');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http
      .delete<string>(`${this.baseUrl}/api/Dashboard/receivables/${id}`, {
        headers,
        responseType: 'text' as 'json',
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          let msg = 'فشل حذف المقبوض';
          if (err.status === 404) msg = 'المقبوض غير موجود';
          return throwError(() => new Error(msg));
        })
      );
  }
  /*****************************************Expense********************************************************/
  // 1. إضافة مصروف جديد
  addExpense(body: {
    date: string;
    procurementStatement: string;
    total: number;
    notes: string;
    workLocationId: number;
    traderId: number;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/expenses`;

    return this.http.post(url, body, { headers, responseType: 'text' }).pipe(
      map((text: string) => ({
        success: true,
        message: text.trim() || 'تم إضافة المصروف بنجاح',
      })),
      catchError((err) => {
        let msg = 'فشل إضافة المصروف';
        if (err.error && typeof err.error === 'string') msg = err.error.trim();
        return of({ success: false, message: msg });
      })
    );
  }

  // 2. جلب كل المصروفات (مع فلاتر)
  getAllExpenses(params?: HttpParams): Observable<ExpensesResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/api/Dashboard/expenses`;

    return this.http.get<ExpensesResponse>(url, { headers, params }).pipe(
      catchError(() =>
        of({
          data: {
            data: [],
            grandTotal: 0,
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 1,
          },
        })
      )
    );
  }

  // 3. جلب مصروف واحد
  getExpenseById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http
      .get(`${this.baseUrl}/api/Dashboard/expenses/${id}`, { headers })
      .pipe(catchError(() => of({ data: {} })));
  }

  // 4. تعديل مصروف
  updateExpense(
    id: number,
    body: {
      date: string;
      procurementStatement: string;
      total: number;
      notes: string;
      workLocationId: number;
      traderId: number;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http
      .put(`${this.baseUrl}/api/Dashboard/expenses/${id}`, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((text: string) => ({
          success: true,
          message: text.trim() || 'تم تعديل المصروف بنجاح',
        })),
        catchError((err) => of({ success: false, message: 'فشل التعديل' }))
      );
  }

  // 5. حذف مصروف
  deleteExpense(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http
      .delete<string>(`${this.baseUrl}/api/Dashboard/expenses/${id}`, {
        headers,
        responseType: 'text' as 'json',
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          let msg = 'فشل حذف المصروف';
          if (err.status === 404) msg = 'المصروف غير موجود';
          return throwError(() => new Error(msg));
        })
      );
  }

  // 6. جلب قائمة التجار للسيلكت (dropdown)
  getTradersForDropdown(): Observable<TraderForSelection[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http
      .get<TraderForSelection[]>(
        `${this.baseUrl}/api/Dashboard/traders/dropdown`,
        { headers }
      )
      .pipe(catchError(() => of([])));
  }

  /*****************************************WorkHours********************************************************/
  // addWorkHours
  addWorkHours(body: {
    date: string;
    hoursNumber: number;
    price: number;
    extraBonus: number;
    notes: string;
    equipmentId: number;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/workhours`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نتعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة تسجيل ساعة العمل بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل تسجيل ساعة العمل';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في تسجيل ساعة العمل:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // get all WorkHours
  getAllWorkHours(params?: HttpParams): Observable<WorkHoursResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/workhours`;

    return this.http.get<WorkHoursResponse>(url, { headers, params }).pipe(
      catchError(() =>
        of({
          data: {
            data: [],
            grandTotal: 0,
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 1,
          },
        })
      )
    );
  }

  getWorkHoursById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/workhours/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching workhours by id:', err);
        return of({ data: {} });
      })
    );
  }

  // تعديل مصروف
  updateWorkHours(
    id: number,
    body: {
      date: string;
      hoursNumber: number;
      price: number;
      extraBonus: number;
      notes: string;
      equipmentId: number;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http
      .put(`${this.baseUrl}/api/Dashboard/workhours/${id}`, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((text: string) => ({
          success: true,
          message: text.trim() || 'تم تعديل ساعة العمل بنجاح',
        })),
        catchError((err) => of({ success: false, message: 'فشل التعديل' }))
      );
  }

  // delete WorkHours
  deleteWorkHours(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token : 'No token found');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/api/Dashboard/workhours/${id}`;
    return this.http
      .delete<string>(url, { headers, responseType: 'text' as 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حذف ساعة العمل ${id}:`, error);
          let errorMessage = `فشل حذف ساعة العمل ${id}`;
          if (error.status === 401) {
            errorMessage = 'غير مصرح. تحقق من الـ token أو الصلاحيات.';
          } else if (error.status === 400) {
            errorMessage = 'طلب غير صالح. تحقق من بيانات الطلب.';
          } else if (error.status === 404) {
            errorMessage = 'ساعة العمل غير موجود.';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /*****************************************RegisterTransfers********************************************************/
  // addRegisterTransfers
  addRegisterTransfers(body: {
    date: string;
    transfersNumber: number;
    priceForTransfer: number;
    extraBonus: number;
    notes: string;
    equipmentId: number;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/transfers`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نتعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة تسجيل نقل بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل تسجيل نقل';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في تسجيل نقل:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // get all RegisterTransfers
  getAllRegisterTransfers(
    params?: HttpParams
  ): Observable<RegisterTransfersResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/transfers`;

    return this.http
      .get<RegisterTransfersResponse>(url, { headers, params })
      .pipe(
        catchError(() =>
          of({
            data: {
              data: [],
              grandTotal: 0,
              pageNumber: 1,
              pageSize: 10,
              totalCount: 0,
              totalPages: 1,
            },
          })
        )
      );
  }

  // جلب تجسيل نقلة واحدة
  getRegisterTransfersById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/transfers/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching register transfers by id:', err);
        return of({ data: {} });
      })
    );
  }

  // تعديل مصروف
  updateRegisterTransfers(
    id: number,
    body: {
      date: string;
      transfersNumber: number;
      priceForTransfer: number;
      extraBonus: number;
      notes: string;
      equipmentId: number;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http
      .put(`${this.baseUrl}/api/Dashboard/transfers/${id}`, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((text: string) => ({
          success: true,
          message: text.trim() || 'تم تعديل المقبوض بنجاح',
        })),
        catchError((err) => of({ success: false, message: 'فشل التعديل' }))
      );
  }

  // delete RegisterTransfers
  deleteRegisterTransfers(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token : 'No token found');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http
      .delete<string>(`${this.baseUrl}/api/Dashboard/transfers/${id}`, {
        headers,
        responseType: 'text' as 'json',
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          let msg = 'فشل حذف المقبوض';
          if (err.status === 404) msg = 'المقبوض غير موجود';
          return throwError(() => new Error(msg));
        })
      );
  }

  // 6. جلب قائمة التجار للسيلكت (dropdown)
  getEquipmentsForDropdown(): Observable<EquipmentForSelection[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http
      .get<EquipmentForSelection[]>(
        `${this.baseUrl}/api/Dashboard/equipments/dropdown
`,
        { headers }
      )
      .pipe(catchError(() => of([])));
  }

  /*****************************************Employee-Advance********************************************************/
  // addworkingperiods
  addworkingperiods(body: {
    startDate: string;
    endDate: string;
    extraWork: number;
    workSystem: string;
    salary: number;
    employeeId: number | null;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/workingperiods`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نتعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة فترة العمل بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل فترة العمل';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في فترة العمل:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // get all workingperiods
  getAllworkingperiods(
    params?: HttpParams
  ): Observable<workingperiodsResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/api/Dashboard/workingperiods`;
    return this.http.get<workingperiodsResponse>(url, { headers, params }).pipe(
      catchError(() =>
        of({
          data: {
            data: [],
            grandTotal: 0,
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 1,
          },
        })
      )
    );
  }

  // جلب الفترة واحدة
  getworkingperiodById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/workingperiods/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching workingperiods by id:', err);
        return of({ data: {} });
      })
    );
  }

  // تعديل الفترة
  updateworkingperiod(
    id: number,
    body: {
      startDate: string;
      endDate: string;
      extraWork: number;
      workSystem: string;
      salary: number;
      employeeId: number | null;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http
      .put(`${this.baseUrl}/api/Dashboard/workingperiods/${id}`, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((text: string) => ({
          success: true,
          message: text.trim() || 'تم تعديل فترة العمل بنجاح',
        })),
        catchError((err) => of({ success: false, message: 'فشل التعديل' }))
      );
  }

  // delete workingperiod
  deleteworkingperiod(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token : 'No token found');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const url = `${this.baseUrl}/api/Dashboard/workingperiods/${id}`;
    return this.http
      .delete<string>(url, { headers, responseType: 'text' as 'json' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حذف الفترة ${id}:`, error);
          let errorMessage = `فشل حذف الفترة ${id}`;
          if (error.status === 401) {
            errorMessage = 'غير مصرح. تحقق من الـ token أو الصلاحيات.';
          } else if (error.status === 400) {
            errorMessage = 'طلب غير صالح. تحقق من بيانات الطلب.';
          } else if (error.status === 404) {
            errorMessage = 'الفترة غير موجود.';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // get all employees-main
  getAllemployeesMain(): Observable<employeesForSelection[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http
      .get<employeesForSelection[]>(
        `${this.baseUrl}/api/Dashboard/employees/dropdown
`,
        { headers }
      )
      .pipe(catchError(() => of([])));
  }

  /*****************************************AppUser********************************************************/
  // addAppUser
  addAppUser(body: {
    email: string;
    password: string;
    role: string;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/addAppUser`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نتعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة السمتخدم بنجاح',
          };
        }),
        catchError((error) => {
          let msg = 'فشل إضافة مستخدم';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          } else if (error.message) {
            msg = error.message;
          }
          console.error('خطأ في إضافة مستخدم:', error);
          return of({
            // ← نرجع نفس الشكل حتى في حالة الخطأ
            success: false,
            message: msg,
          });
        })
      );
  }

  // get all AppUser
  getAllAppUser(params?: HttpParams): Observable<AppUsersResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/getAllUsers`;

    return this.http.get<AppUsersResponse>(url, { headers, params }).pipe(
      map(
        (res: AppUsersResponse) =>
          res || {
            data: [],
          }
      ),
      catchError((err) => {
        console.error('Error fetching getAllUsers:', err);
        return of({
          data: [],
        });
      })
    );
  }

  // جلب مستخدم واحد
  getAppUserById(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Dashboard/getAppUserById/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching app user by id:', err);
        return of({ data: {} });
      })
    );
  }

  // تعديل سلفة
  updateAppUser(
    id: string,
    body: {
      email: string;
      password: string;
      role: string;
    }
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Dashboard/updateAppUser/${id}`;

    return this.http
      .put(url, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((textResponse: string) => ({
          success: true,
          message: textResponse.trim() || 'تم تعديل المستخدم بنجاح',
        })),
        catchError((error) => {
          let msg = 'فشل تعديل المستخدم';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          }
          return of({ success: false, message: msg });
        })
      );
  }
}
