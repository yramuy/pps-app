
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

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveUserData(userData: any): void {
    localStorage.setItem('user', JSON.stringify(userData));
    this.userSubject.next(userData);
  }

  private getUserFromStorage(): any {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }

  getUser(): any {
    return this.userSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check whether the JWT token has expired
  isTokenExpired(): boolean {
    const token = this.getToken();

    if (!token) {
      return true;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      const payload = parts[1];
      const decoded = atob(
        payload
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(Math.ceil(payload.length / 4) * 4, '='),
      );

      const tokenData = JSON.parse(decoded);

      if (
        typeof tokenData.exp !== 'number' ||
        !Number.isFinite(tokenData.exp)
      ) {
        return true;
      }

      return tokenData.exp <= Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  // Check login status and token expiration
  isLoggedIn(): boolean {
    const user = this.userSubject.value;
    const token = this.getToken();

    return !!user && !!token && !this.isTokenExpired();
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }
}
