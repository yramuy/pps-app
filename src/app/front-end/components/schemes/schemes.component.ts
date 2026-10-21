
import { Component, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
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

  private pendingApiCalls = 0;
  isLoading = false;

  showAllSchemes = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    this.loadTopFiveSchemes();
  }

  private requestWithLoader(endpoint: string, payload: any): any {
    this.pendingApiCalls++;
    this.isLoading = true;

    return this.apiService.request('POST', endpoint, payload).pipe(
      finalize(() => {
        this.pendingApiCalls = Math.max(
          0,
          this.pendingApiCalls - 1
        );

        this.isLoading = this.pendingApiCalls > 0;
      }),
    );
  }

  loadTopFiveSchemes() {
    this.loading.set(true);
    this.message.set('');

    const payload = {
      mode: 'mobile',
      post_date: '',
      scheme_type: ''
    };

    this.requestWithLoader('/allSchemes', payload).subscribe({
      next: (res: any) => {
        this.schemes.set(res.scheme_list || []);
        this.loading.set(false);
      },

      error: (err: any) => {
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

  toggleSchemes() {
    this.showAllSchemes = !this.showAllSchemes;
  }
}
