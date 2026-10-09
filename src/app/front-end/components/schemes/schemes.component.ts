
import { Component, signal } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-schemes',
  templateUrl: './schemes.component.html',
  styleUrls: ['./schemes.component.scss'],
})
export class SchemesComponent {

  schemes = signal<any[]>([]);
  message = signal('');
  loading = signal(true);

  selectedScheme: any = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    this.loadTopFiveSchemes();
  }

  loadTopFiveSchemes() {

    this.loading.set(true);
    this.message.set('');

    const payload = {
      mode: '0',
    };

    this.apiService.request('POST', '/topFiveSchemes', payload).subscribe({

      next: (res: any) => {

        this.schemes.set(res.topFive_schemes || []);

        console.log('schemes:', this.schemes());

        // Stop loader after API response
        this.loading.set(false);
      },

      error: (err: any) => {

        // Stop loader on error also
        this.loading.set(false);

        if (err.status === 401) {

          this.message.set('Token expired');
          this.authService.logout();

        } else if (err.status === 400) {

          this.message.set('Invalid request data');

        } else if (err.status === 500) {

          this.message.set('Server error. Please try again later');

        } else {

          this.message.set(
            'Something went wrong. Please try again later'
          );

        }
      },

    });
  }
}

