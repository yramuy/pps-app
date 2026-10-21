import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';

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

  private pendingApiCalls = 0;
  isLoading = false;
  showAllIssues = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private globalService: GlobalService,
    private router: Router,
  ) {
    this.loadAllIssues();
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

  loadAllIssues() {
    this.loading.set(true);
    this.message.set('');

    const payload = {
      state_id: '',
      district_id: '',
      assembly_id: '',
      mandal_id: '',
      village_id: '',
      is_token: '0',
    };

    this.requestWithLoader('/allIssues', payload).subscribe({
      next: (res: any) => {
        this.issues.set(res.all_issues || []);
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

  toggleIssues() {
    this.showAllIssues = !this.showAllIssues;
  }

  viewIssue(issueId: number): void {
    this.globalService.setIssueID(issueId);
    this.globalService.setIsIssueLogin(true);
    
    this.router.navigate(['/issue-details', issueId]);
  }
}
