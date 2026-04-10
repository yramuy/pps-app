import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  private apiUrl = '/BioMetricAttendance/login';

  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }) {
    return this.http.post(this.apiUrl, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  saveUserData(userData: any) {
    localStorage.setItem('user', JSON.stringify(userData));
    this.userSubject.next(userData);
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  loadUserFromStorage() {
    const user = this.getUser();
    if (user) {
      this.userSubject.next(user);
    }
  }

  // auth.service.ts
  isLoggedIn$ = new BehaviorSubject<boolean>(
    JSON.parse(localStorage.getItem('isLoggedIn') || 'false'),
  );

  setLoginStatus(status: boolean) {
    localStorage.setItem('isLoggedIn', JSON.stringify(status));
    this.isLoggedIn$.next(status);
  }

  isLoggedIn(): boolean {
    return JSON.parse(localStorage.getItem('isLoggedIn') || 'false');
  }
}
