import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-issue-details',
  templateUrl: './issue-details.component.html',
  styleUrls: ['./issue-details.component.scss'],
})
export class IssueDetailsComponent implements OnInit {
  issueData: any = {};
  message: string = '';
  loading: boolean = false;
  issueId: any;
  issue_images: any = [];
  private pendingApiCalls = 0;
  isLoading = false;
  diamond_count = 0;
  bronze_count = 0;
  user: any;
  isLogin: boolean = false;
  isMessage: boolean = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Move page to top
    window.scrollTo(0, 0);

    // Get issue ID from URL
    this.issueId = this.route.snapshot.paramMap.get('id');

    console.log('Issue ID:', this.issueId);

    this.loadIsLogin();

    this.authService.user$.subscribe((user) => {
      this.user = user;
    });

    // Check ID before API call
    if (this.issueId) {
      this.loadIssueData();
    } else {
      this.message = 'Issue ID not found';
    }
  }

  loadIsLogin(): void {
    this.isLogin = this.authService.isLoggedIn();

    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
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

  loadIssueData(): void {
    this.loading = true;
    this.message = '';

    const payload = {
      is_token: '0',
      issue_id: this.issueId,
    };

    console.log('Issue API Payload:', payload);

    this.requestWithLoader('/issueDataById', payload).subscribe({
      next: (res: any) => {
        console.log('Issue Details Response:', res);

        this.diamond_count = res?.diamond_count;

        this.bronze_count = res?.bronze_count;

        this.issueData = res?.issueData || {};

        this.issue_images = res.issue_images[0] || [];

        this.loading = false;
      },

      error: (err: any) => {
        console.error('Issue Details Error:', err);

        if (err.status === 400) {
          this.message = 'Invalid request data';
        } else if (err.status === 500) {
          this.message = 'Server error. Please try again later';
        } else {
          this.message = 'Something went wrong. Please try again later';
        }

        this.loading = false;
      },
    });
  }

  saveVoting(voteType: 'diamond' | 'bronze'): void {
    // Check login before voting
    if (!this.authService.isLoggedIn()) {
      const confirmed = window.confirm(
        'You must log in to vote. Would you like to go to the login page?',
      );

      if (confirmed) {
        this.router.navigate(['/admin/login']);
      }

      return; // Stop voting if not logged in
    }

    // Validate issue and user
    if (!this.issueId || !this.user?.userId) {
      this.showMessage('Unable to vote. Please log in and try again.');
      return;
    }

    const payload = {
      issue_id: this.issueId,
      created_by: this.user.userId,
      vote_type: voteType,
    };

    this.requestWithLoader('/saveAndUpdateVoting', payload).subscribe({
      next: (res: any) => {
        this.loadIssueData();
        this.showMessage(res.message || 'Vote updated successfully.');
      },

      error: (err: any) => {
        console.error('Voting API error:', err);
        this.showMessage('Unable to update vote. Please try again.');
      },
    });
  }

  // =====================================================
  // Message
  // =====================================================

  showMessage(msg: string): void {
    this.message = msg;

    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
