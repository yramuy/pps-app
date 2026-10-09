
import { Component, signal } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss'],
})
export class IssuesComponent {

  issues = signal<any[]>([]);
  message = signal('');
  loading = signal(true);

  selectedIssue: any = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    this.loadTopFiveIssues();
  }

  loadTopFiveIssues() {

    this.loading.set(true);
    this.message.set('');

    const payload = {
      state_id: '',
      district_id: '',
      assembly_id: '',
      mandal_id: '',
      village_id: '',
      mode: '0'
    };

    this.apiService.request('POST', '/topFiveIssues', payload).subscribe({

      next: (res: any) => {

        this.issues.set(res.top_five_issues || []);

        console.log('Issues:', this.issues());

        // Stop loader after data is received
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

          this.message.set('Something went wrong. Please try again later');

        }
      },

    });
  }
}

