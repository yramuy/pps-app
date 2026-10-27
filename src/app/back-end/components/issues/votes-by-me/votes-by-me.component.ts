
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { finalize } from 'rxjs/operators';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-votes-by-me',
  templateUrl: './votes-by-me.component.html',
  styleUrls: ['./votes-by-me.component.scss'],
})
export class VotesByMeComponent implements OnDestroy {
  // =====================================================
  // COMPONENT DATA
  // =====================================================

  issuesList: any[] = [];
  loginUser: any = null;

  loading = false;
  isLoading = false;
  message = '';

  // Category filter only
  categories: any[] = [];
  selectedCategoryId = '';

  private userSubscription?: Subscription;
  private pendingApiCalls = 0;

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public loader: LoaderService,
    private router: Router
  ) {
    this.userSubscription = this.authService.user$.subscribe({
      next: (user: any) => {
        this.loginUser = user;

        if (user) {
          this.initializeFilters();
        }
      },
      error: (err: any) => {
        console.error('User subscription error:', err);
      },
    });
  }

  // =====================================================
  // API REQUEST WITH LOADER
  // =====================================================

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

  // =====================================================
  // INITIALIZE
  // =====================================================

  private initializeFilters(): void {
    this.selectedCategoryId = '';

    this.loadCategories();
    this.loadAllIssues(this.loginUser);
  }

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  loadCategories(): void {
    const payload = JSON.stringify({
      master_id: 1,
      mode: 'web',
    });

    this.requestWithLoader('/masterData', payload).subscribe({
      next: (res: any) => {
        this.categories = res.master_data || [];
      },
      error: (err: any) => {
        console.error('Category loading failed:', err);
        this.categories = [];
      },
    });
  }

  // =====================================================
  // CATEGORY FILTER
  // =====================================================

  onCategoryChange(event: Event): void {
    this.selectedCategoryId = (
      event.target as HTMLSelectElement
    ).value;

    this.loadAllIssues(this.loginUser);
  }

  // =====================================================
  // RESET CATEGORY FILTER
  // =====================================================

  resetFilters(): void {
    this.selectedCategoryId = '';
    this.loadAllIssues(this.loginUser);
  }

  // =====================================================
  // LOAD ISSUES VOTED BY ME
  // =====================================================

  loadAllIssues(user: any): void {
    if (!user) {
      return;
    }

    this.loading = true;
    this.message = '';

    this.loader.show();

    // Send ONLY these three parameters.
    const payloadObj = {
      is_token: '1',
      voted_by: user.userId,
      // category_id: this.selectedCategoryId || '',
    };

    const payload = JSON.stringify(payloadObj);

    console.log('Votes By Me Payload:', payload);

    this.requestWithLoader('/myVotedIssues', payload).subscribe({
      next: (res: any) => {
        this.issuesList = res.votes || [];

        this.loading = false;
        this.loader.hide();

        this.refreshDataTable();
      },

      error: (err: any) => {
        console.error('Votes By Me API Error:', err);

        if (err.status === 401) {
          this.message = 'Token expired';
          this.authService.logout();
        } else if (err.status === 400) {
          this.message = 'Invalid request data';
        } else if (err.status === 500) {
          this.message = 'Server error. Please try again later';
        } else {
          this.message = 'Something went wrong. Please try again later';
        }

        this.issuesList = [];
        this.loading = false;

        this.loader.hide();
        this.destroyDataTable();
      },
    });
  }

  // =====================================================
  // GET ISSUE IMAGE
  // =====================================================

  getIssueImage(issue: any): string | null {
  if (!issue?.image) {
    return null;
  }

  // API returns a single image URL
  if (typeof issue.image === 'string') {
    return issue.image.trim() || null;
  }

  // Support an array of images if returned by the API
  if (Array.isArray(issue.image) && issue.image.length > 0) {
    const firstImage = issue.image[0];

    if (typeof firstImage === 'string') {
      return firstImage.trim() || null;
    }

    return firstImage?.url || null;
  }

  return null;
}

  // =====================================================
  // IMAGE ERROR HANDLER
  // =====================================================

  onIssueImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.style.display = 'none';

    const placeholder = img.parentElement?.querySelector(
      '.issue-image-placeholder'
    ) as HTMLElement | null;

    if (placeholder) {
      placeholder.style.display = 'flex';
    } else if (img.parentElement) {
      const div = document.createElement('div');

      div.className = 'issue-image-placeholder';
      div.innerHTML =
        '<i class="fas fa-image"></i><span>No Image Available</span>';

      img.parentElement.appendChild(div);
    }
  }

  // =====================================================
  // DATATABLE
  // =====================================================

  private refreshDataTable(): void {
    this.destroyDataTable();

    setTimeout(() => {
      if (
        typeof $ !== 'undefined' &&
        $.fn.DataTable &&
        this.issuesList.length > 0 &&
        !$.fn.DataTable.isDataTable('#issuesTable')
      ) {
        ($('#issuesTable') as any).DataTable({
          dom: 'Bfrtip',
          buttons: ['excel', 'pdf'],
          responsive: true,
        });
      }
    }, 0);
  }

  // =====================================================
  // DESTROY DATATABLE
  // =====================================================

  private destroyDataTable(): void {
    if (
      typeof $ !== 'undefined' &&
      $.fn.DataTable &&
      $.fn.DataTable.isDataTable('#issuesTable')
    ) {
      ($('#issuesTable') as any).DataTable().destroy();
    }
  }

  // =====================================================
  // VIEW ISSUE
  // =====================================================

  handleView(id: any): void {
    this.router.navigate(['/admin/issues/view-issue'], {
      state: {
        issueID: id,
      },
    });
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.destroyDataTable();
  }
}
