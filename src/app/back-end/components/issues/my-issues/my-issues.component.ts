
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-my-issues',
  templateUrl: './my-issues.component.html',
  styleUrls: ['./my-issues.component.scss'],
})
export class MyIssuesComponent implements OnInit, OnDestroy {

  // Issues
  myIssues: any[] = [];
  loginUser: any = null;

  // Loading and messages
  loading = false;
  isLoading = false;
  message = '';
  isMessage = false;

  // Category filter
  categories: any[] = [];
  selectedCategory = '';

  private pendingApiCalls = 0;
  private userSubscription?: Subscription;
  private messageTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public loader: LoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Load categories
    this.loadCategories();

    // Display navigation message if available
    const state = history.state;

    if (state?.message) {
      this.showMessage(state.message);

      history.replaceState(
        {
          ...history.state,
          message: null
        },
        ''
      );
    }

    // Get logged-in user
    this.userSubscription = this.authService.user$.subscribe({
      next: (user: any) => {

        this.loginUser = user;

        if (user?.userId) {
          this.loadMyIssues(user);
        } else {
          this.myIssues = [];
        }

      },
      error: (err: any) => {
        console.error('User subscription failed:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
  }

  // =====================================
  // API Request with Loader
  // =====================================

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

      })
    );
  }

  // =====================================
  // Load Categories
  // =====================================

  loadCategories(): void {

    const payload = JSON.stringify({
      master_id: 1,
      mode: 'web'
    });

    this.requestWithLoader('/masterData', payload).subscribe({

      next: (res: any) => {
        this.categories = res?.master_data || [];
      },

      error: (err: any) => {
        console.error('Category loading failed:', err);
        this.categories = [];
      }

    });
  }

  // =====================================
  // Load My Issues
  // =====================================

  loadMyIssues(user: any): void {

    this.loader.show();

    const payloadObj: any = {
      created_by: user.userId,
      category_id: ''
    };

    const payload = JSON.stringify(payloadObj);

    this.requestWithLoader('/myIssues', payload).subscribe({

      next: (res: any) => {

        this.myIssues = res?.my_issues || [];

        console.log('My Issues:', this.myIssues);

        this.loader.hide();

      },

      error: (err: any) => {

        console.error('My issues loading failed:', err);

        this.loader.hide();

        if (err.status === 401) {

          this.message = 'Token expired';
          this.isMessage = true;

          this.authService.logout();

        } else if (err.status === 400) {

          this.showMessage('Invalid request data');

        } else if (err.status === 500) {

          this.showMessage('Server error. Please try again later');

        } else {

          this.showMessage('Something went wrong. Please try again later');

        }

      }

    });
  }

  // =====================================
  // Category Filter
  // =====================================

  onCategoryChange(event: Event): void {

    const selectElement = event.target as HTMLSelectElement;

    this.selectedCategory = selectElement.value;

  }

  // =====================================
  // Reset Filters
  // =====================================

  resetFilters(): void {

    this.selectedCategory = '';

  }

  // =====================================
  // Filter Issues
  // =====================================

  filteredIssues(): any[] {

    const category = this.selectedCategory;

    if (!category) {
      return this.myIssues;
    }

    return this.myIssues.filter((issue: any) =>
      String(issue.category_id) === String(category)
    );

  }

  // =====================================
  // Get Issue Image
  // =====================================

  getIssueImage(issue: any): string | null {

    return issue?.issue_pic || null;

  }

  // =====================================
  // Issue Image Error
  // =====================================

  onIssueImageError(event: Event, issue: any): void {

    issue.imageLoadError = true;

  }

  // =====================================
  // Edit Issue
  // =====================================

  handleEdit(issueObj: any): void {

    this.router.navigate(['/admin/issues/create'], {
      state: {
        issue: issueObj,
        isEdit: true
      }
    });

  }

  // =====================================
  // View Issue
  // =====================================

  handleView(id: any): void {

    this.router.navigate(['/admin/issues/view-issue'], {
      state: {
        issueID: id
      }
    });

  }

  // =====================================
  // Delete Confirmation
  // =====================================

  confirmDelete(id: string): void {

    if (confirm('Are you sure you want to delete this record?')) {
      this.deleteIssue(id);
    }

  }

  // =====================================
  // Delete Issue
  // =====================================

  deleteIssue(id: string): void {

    const payload = JSON.stringify({
      id: id,
      master_id: '9'
    });

    this.requestWithLoader('/deleteRecord', payload).subscribe({

      next: (res: any) => {

        this.showMessage(
          res?.message || 'Issue deleted successfully'
        );

        // Remove deleted issue from current list
        this.myIssues = this.myIssues.filter(
          (issue: any) => String(issue.id) !== String(id)
        );

      },

      error: (err: any) => {

        console.error('Delete issue failed:', err);

        if (err.status === 401) {

          this.showMessage('Token expired');
          this.authService.logout();

        } else {

          this.showMessage(
            err?.error?.message || 'Unable to delete issue. Please try again.'
          );

        }

      }

    });

  }

  // =====================================
  // Show Message
  // =====================================

  showMessage(msg: string): void {

    this.message = msg;
    this.isMessage = true;

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    this.messageTimeout = setTimeout(() => {
      this.isMessage = false;
    }, 3000);

  }

}
