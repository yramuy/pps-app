import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  user$ = this.userSubject.asObservable();

  private apiUrl = '/pps/login';

  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }) {
    return this.http.post(this.apiUrl, data);
  }

  // ✅ Save token
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  // ✅ Save user + update signal instantly
  saveUserData(userData: any) {
    localStorage.setItem('user', JSON.stringify(userData));
    this.userSubject.next(userData); // 🔥 immediate update
  }

  // ✅ Get from storage
  private getUserFromStorage() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  getUser() {
    return this.userSubject.value;
  }

  // ✅ Login check based on user
  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  // ✅ Logout
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }
}