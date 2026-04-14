import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = '/pps'; // change this

  constructor(private http: HttpClient) {}

  request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    payload: any = null,
    authRequired: boolean = true,
  ): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (authRequired) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const options: any = {
      headers,
    };

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
