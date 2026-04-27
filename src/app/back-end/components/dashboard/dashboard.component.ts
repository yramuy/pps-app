// src/app/dashboard/dashboard.component.ts

import { Component, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  // ✅ Convert observable → signal
  loginUser = toSignal(this.authService.user$, { initialValue: null });

  // 🔹 Signals for stats
  totalIssues = signal(120);
  resolved = signal(80);
  pending = signal(40);
  critical = signal(10);
  message = signal('');

  recent_issues = signal<any[]>([]);
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    // ✅ auto trigger when user available
    effect(() => {
      const user = this.loginUser();

      if (user) {
        this.loadRecentIssues(user);
      }
    });
  }

  loadRecentIssues(user: any) {
    this.loading.set(true);

    const payload = {
      state_id: user?.stateID,
      district_id: user?.districtID,
      assembly_id: user?.assemblyID,
      mandal_id: user?.mandalID,
      village_id: user?.villageID,
    };

    this.apiService.request('POST', '/topFiveIssues', payload).subscribe({
      next: (res: any) => {
        this.recent_issues.set(res.top_five_issues || []);
        this.loading.set(false);
      },
      error: (err: any) => {
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
        this.loading.set(false);
      },
    });
  }
}
