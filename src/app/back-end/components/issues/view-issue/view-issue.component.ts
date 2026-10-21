import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.scss'],
})
export class ViewIssueComponent implements OnInit, OnDestroy {
  issueID: any = '';
  issueData: any = {};

  selectedStatusId: any = '';
  issueWorkflowList: any = [];

  message = '';
  isMessage = false;
  isLoading = false;

  issue_comment = '';
  wf_comment = '';

  loginUser: any;
  issueComments: any[] = [];
  issueStatuses: any[] = [];
  issue_images: any[] = [];

  views: any = 0;

  private routerSubscription?: Subscription;
  private userSubscription?: Subscription;

  diamondCount = 0;
  bronzeCount = 0;
  isDiamondSelected = false;
  isBronzeSelected = false;
  isVoting = false;
  private pendingApiCalls = 0;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    public loader: LoaderService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    // Get logged-in user
    this.userSubscription = this.authService.user$.subscribe((user: any) => {
      this.loginUser = user;

      console.log('Logged User:', this.loginUser);

      if (this.issueID && this.loginUser?.userId) {
        this.saveIssueView();
      }
    });

    // Load issue when component is opened
    this.loadIssueFromState();

    // IMPORTANT:
    // This will also fire when navigating to the same URL
    // because onSameUrlNavigation: 'reload' is enabled.
    this.routerSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event: NavigationEnd) => {
        console.log('Navigation completed:', event.urlAfterRedirects);

        this.loadIssueFromState();
      });

    this.loadVotingByIssueIdAndUserId();
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

  loadVotingByIssueIdAndUserId() {
    const payload = {
      issue_id: this.issueID,
      created_by: this.loginUser.userId,
    };

    this.requestWithLoader('/votingByIssueIdAndUserId', payload).subscribe({
      next: (res: any) => {
        this.isDiamondSelected = Number(res.voting.is_diamond || 0) === 1;

        this.isBronzeSelected = Number(res.voting.is_bronze || 0) === 1;

        // this.isVoting = false;
      },
      error: (err: any) => {
        console.error('Voting API error:', err);
        this.showMessage('Unable to update vote. Please try again.');
        // this.isVoting = false;
      },
    });
  }

  saveVoting(voteType: 'diamond' | 'bronze'): void {
    if (!this.issueID || !this.loginUser?.userId || this.isVoting) {
      return;
    }

    // this.isVoting = true;

    // this.loader.show();

    const payload = {
      issue_id: this.issueID,
      created_by: this.loginUser.userId,
      vote_type: voteType,
    };

    this.requestWithLoader('/saveAndUpdateVoting', payload).subscribe({
      next: (res: any) => {
        this.loadViewIssueDeta(this.issueID);

        this.loadVotingByIssueIdAndUserId();

        this.showMessage(res.message || 'Vote updated successfully.');

        // this.isVoting = false;

        // this.loader.hide();
      },
      error: (err: any) => {
        console.error('Voting API error:', err);
        this.showMessage('Unable to update vote. Please try again.');
        // this.isVoting = false;
        // this.loader.hide();
      },
    });
  }

  // =====================================================
  // Load Issue From Navigation State
  // =====================================================

  loadIssueFromState(): void {
    this.isLoading = true;
    const state = history.state;

    const newIssueID = state?.issueID;

    console.log('Navigation State:', state);

    console.log('Navigation State Issue ID:', newIssueID);

    if (!newIssueID) {
      console.log('No issue ID found');
      return;
    }

    console.log('Loading Issue ID:', newIssueID);

    // Update current issue
    this.issueID = newIssueID;

    // Clear previous issue data
    this.resetIssueData();

    // Load new issue data
    this.loadViewIssueDeta(this.issueID);

    // Load statuses
    this.loadStatuses();

    // Save view
    if (this.loginUser?.userId) {
      this.saveIssueView();
    }

    // update Notification status

    this.updateNotificationStatus();
  }

  // =====================================================
  // Reset Issue Data
  // =====================================================

  resetIssueData(): void {
    this.issueData = {};

    this.issueComments = [];

    this.issueWorkflowList = [];

    this.issue_images = [];

    this.views = 0;

    this.selectedStatusId = '';

    this.issue_comment = '';

    this.wf_comment = '';
  }

  // =====================================================
  // Load Statuses
  // =====================================================

  loadStatuses(): void {
    const payload = {
      master_id: '11',
      mode: 'web',
    };

    this.requestWithLoader('/masterData', payload).subscribe({
      next: (res: any) => {
        this.issueStatuses = res?.master_data || [];
      },

      error: (err: any) => {
        console.error('Status API Error:', err);
      },
    });
  }

  // =====================================================
  // Location
  // =====================================================

  getLocation(): string {
    const parts = [
      this.issueData.assembly,
      this.issueData.mandal,
      this.issueData.village,
    ];

    return parts.filter((p) => p && p.trim() !== '').join(', ');
  }

  // =====================================================
  // Save Issue View
  // =====================================================

  saveIssueView(): void {
    if (!this.issueID || !this.loginUser?.userId) {
      return;
    }

    const payload = {
      issue_id: this.issueID,
      viewed_by: this.loginUser.userId,
    };

    console.log('Saving issue view:', payload);

    this.requestWithLoader('/saveIssueViews', payload).subscribe({
      next: (res: any) => {
        console.log('Issue view saved:', res);
      },

      error: (err: any) => {
        console.error('Save issue view error:', err);
      },
    });
  }

  // =====================================================
  // Save Issue View
  // =====================================================

  updateNotificationStatus(): void {
    const payload = {
      issue_id: this.issueID,
      is_read: 1,
      login_user_id: this.loginUser.userId,
    };

    console.log('updateNotificationStatus payload :', payload);

    this.requestWithLoader('/updateNotificationStatus', payload).subscribe({
      next: (res: any) => {
        console.log('updateNotificationStatus:', res);

        // Tell Header component to reload notifications
        this.notificationService.refreshNotificationList();
      },

      error: (err: any) => {
        console.error('updatenotification error:', err);
      },
    });
  }

  // =====================================================
  // Load Issue Details
  // =====================================================

  loadViewIssueDeta(issueID: any): void {
    this.isLoading = true;

    if (!issueID) {
      return;
    }

    // this.loader.show();

    console.log('Calling issue API:', `/issueDataById/${issueID}`);

    const payload = {
      is_token: '1',
      issue_id: issueID,
    };

    console.log('Issue API Payload:', payload);

    this.requestWithLoader('/issueDataById', payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (res: any) => {
          console.log('Issue response:', res);

          this.issueData = res?.issueData || {};

          this.issueComments = res?.comments || [];

          this.issueWorkflowList = res?.workflow || [];

          this.views = res?.views || 0;

          this.issue_images = res?.issue_images || [];

          this.selectedStatusId = this.issueData?.status_id || '';

          this.diamondCount = res?.diamond_count;

          this.bronzeCount = res?.bronze_count;

          // this.loader.hide();
        },

        error: (err: any) => {
          console.error('Issue loading error:', err);
          this.isLoading = false;

          // this.loader.hide();
        },
      });
  }

  // =====================================================
  // Submit Workflow
  // =====================================================

  submitWorkFlow(form: any): void {
    if (form.invalid) {
      return;
    }

    const payload = {
      issue_id: this.issueID,
      created_by: this.loginUser?.userId,
      comment: this.wf_comment,
      status_id: this.selectedStatusId,
    };

    this.loader.show();

    this.requestWithLoader('/saveIssueWorkflow', payload).subscribe({
      next: (res: any) => {
        this.showMessage(res.message);

        form.resetForm();

        this.wf_comment = '';

        this.loadViewIssueDeta(this.issueID);

        // this.loader.hide();

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      },

      error: () => {
        // this.loader.hide();
      },
    });
  }

  // =====================================================
  // Submit Comment
  // =====================================================

  submitComment(form: any): void {
    if (form.invalid) {
      return;
    }

    const payload = {
      id: '0',
      issue_id: this.issueID,
      comment: this.issue_comment,
      submitted_by: this.loginUser?.userId,
      submitted_by_name: this.loginUser?.fullName,
      master_id: '12',
    };

    this.loader.show();

    this.requestWithLoader('/saveIssueComment', payload).subscribe({
      next: () => {
        this.issue_comment = '';

        form.resetForm();

        this.loadViewIssueDeta(this.issueID);

        this.loader.hide();
      },

      error: () => {
        this.loader.hide();
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

  // =====================================================
  // Destroy
  // =====================================================

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();

    this.userSubscription?.unsubscribe();
  }
}
