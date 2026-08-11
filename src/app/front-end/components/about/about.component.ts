import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  aboutUs: any = [];
  message: any = '';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    this.loadAboutUsData();
  }

  loadAboutUsData() {
    let payload = {
      mode: '0',
    };
    this.apiService.request('POST', '/aboutUs', payload).subscribe({
      next: (res: any) => {
        this.aboutUs = res.data[0] || [];
      },

      error: (err: any) => {
        if (err.status === 401) {
          this.message = 'Token expired';
        } else if (err.status === 400) {
          this.message = 'Invalid request data';
        } else if (err.status === 500) {
          this.message = 'Server error. Please try again later';
        } else {
          this.message = 'Something went wrong. Please try again later';
        }
      },
    });
  }
}
