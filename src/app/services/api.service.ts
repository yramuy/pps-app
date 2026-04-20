import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = '/pps';

  constructor(private http: HttpClient) {}

  request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    payload: any = null,
    authRequired: boolean = true,
  ): Observable<any> {

    let headers = new HttpHeaders();

    const token = localStorage.getItem('token');
    if (authRequired && token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // ✅ IMPORTANT FIX
    if (!(payload instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    const options: any = { headers };
    const url = `${this.baseUrl}${endpoint}`;

    switch (method) {
      case 'GET':
        return this.http.get(url, options);
      case 'POST':
        return this.http.post(url, payload, options);
      case 'PUT':
        return this.http.put(url, payload, options);
      case 'DELETE':
        return this.http.delete(url, options);
      default:
        throw new Error('Invalid HTTP method');
    }
  }
}