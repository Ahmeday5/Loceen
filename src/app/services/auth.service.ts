import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { UserData } from '../types/login.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private roleSubject = new BehaviorSubject<string[] | null>(
    this.getUserData()?.roles || null
  );
  public role$ = this.roleSubject.asObservable();

  private userData: UserData | null = null;

  constructor() {
    this.loadUserData();
  }

  private loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        this.userData = JSON.parse(userData) as UserData;
        if (this.userData?.roles) {
          this.roleSubject.next(this.userData.roles);
          this.isLoggedInSubject.next(true);
        }
      } catch (error) {
        console.error('خطأ في تحليل userData:', error);
        this.logout();
      }
    }
  }

  login(response: UserData): void {
    if (!response.email || !response.roles || !response.token) {
      throw new Error('بيانات تسجيل الدخول غير صالحة');
    }
    this.userData = response;
    this.isLoggedInSubject.next(true);
    this.roleSubject.next(response.roles || []);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(response));
    localStorage.setItem('token', response.token || '');
  }

  logout(): void {
    if (this.isLoggedInSubject.value) {
      this.isLoggedInSubject.next(false);
      this.roleSubject.next(null);
      this.userData = null;
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('token');
    }
  }

  getUserData(): UserData | null {
    return this.userData;
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('توكن من AuthService:', token);
    return token;
  }

  // جلب الدور الحالي
  getCurrentRole(): string[] | null {
    const role = this.roleSubject.value;
    console.log('الدور الحالي:', role);
    return role;
  }

  getSavedEmail(): string | null {
    const savedEmail = localStorage.getItem('savedEmail');
    console.log('email: ', savedEmail);
    return savedEmail;
  }
}
