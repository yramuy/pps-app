import { Component, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  aboutUs: any = [];
  message = signal('');
  loading = signal(true);

  private pendingApiCalls = 0;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    this.loadAboutUsData();
  }

  private requestWithLoader(endpoint: string, payload: any): any {
    this.pendingApiCalls++;
    this.isLoading = true;

    return this.apiService.request('POST', endpoint, payload).pipe(
      finalize(() => {
        this.pendingApiCalls = Math.max(0, this.pendingApiCalls - 1);
        this.isLoading = this.pendingApiCalls > 0;
      }),
    );
  }

  loadAboutUsData() {
    this.loading.set(true);
    this.message.set('');

    const payload = {
      mode: '0',
    };

    this.requestWithLoader('/aboutUs', payload).subscribe({
      next: (res: any) => {
        this.aboutUs = res.data?.[0] || [];

        // Stop loader after data is received
        this.loading.set(false);
      },

      error: (err: any) => {
        // Stop loader on error
        this.loading.set(false);

        if (err.status === 401) {
          this.message.set('Token expired');
        } else if (err.status === 400) {
          this.message.set('Invalid request data');
        } else if (err.status === 500) {
          this.message.set('Server error. Please try again later');
        } else {
          this.message.set('Something went wrong. Please try again later');
        }
      },
    });
  }
}
