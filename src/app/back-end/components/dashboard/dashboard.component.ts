import { Component, AfterViewInit, signal, effect } from '@angular/core';
import Chart from 'chart.js/auto';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements AfterViewInit {
  // 🔹 Signals for stats
  totalIssues = signal(120);
  resolved = signal(80);
  pending = signal(40);
  critical = signal(10);

  // 🔹 Signals for API data
  recent_issues = signal<any[]>([]);
  loading = signal(false);

  // 🔹 Signals for user + UI
  loginUser = signal<any>(null);
  message = signal('');
  isMessage = signal(false);

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    // ✅ Convert observable → signal-like behavior
    this.authService.user$.subscribe((user) => {
      this.loginUser.set(user);
    });

    // ✅ Auto trigger API when loginUser changes
    effect(
      () => {
        const user = this.loginUser();

        if (user) {
          this.loadRecentIssues(user);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngAfterViewInit() {
    this.loadCharts();
  }

  // 🔥 API call using signals
  loadRecentIssues(user: any) {
    this.loading.set(true);

    const payload = JSON.stringify({
      state_id: user?.stateID,
      district_id: user?.districtID,
      assembly_id: user?.assemblyID,
      mandal_id: user?.mandalID,
      village_id: user?.villageID,
    });

    console.log("Payload : ", payload);

    this.apiService.request('POST', '/topFiveIssues', payload).subscribe({
      next: (res: any) => {
        this.recent_issues.set(res.top_five_issues || []);
        this.loading.set(false);

        console.log("recent_issues : ", this.recent_issues);
      },
      error: (err: any) => {
        this.loading.set(false);

        if (err.status === 401) {
          this.showMessage('Token expired');
          this.authService.setLoginStatus(false);
        } else if (err.status === 400) {
          this.showMessage('Invalid request data');
        } else if (err.status === 500) {
          this.showMessage('Server error. Please try again later');
        } else {
          this.showMessage('Something went wrong. Please try again later');
        }
      },
    });
  }

  // 🔹 Signal-based message handler
  showMessage(msg: string) {
    this.message.set(msg);
    this.isMessage.set(true);

    setTimeout(() => {
      this.isMessage.set(false);
    }, 3000);
  }

  // 🔹 Charts (no change needed)
  loadCharts() {
    new Chart('categoryChart', {
      type: 'bar',
      data: {
        labels: ['Infrastructure', 'Utilities', 'Health', 'Education'],
        datasets: [
          {
            label: 'Issues',
            data: [40, 30, 20, 30],
          },
        ],
      },
    });

    new Chart('regionChart', {
      type: 'pie',
      data: {
        labels: ['North', 'South', 'East', 'West'],
        datasets: [
          {
            data: [30, 25, 35, 30],
          },
        ],
      },
    });
  }
}
