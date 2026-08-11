import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

declare const $: any;

@Component({
  selector: 'app-my-issues',
  templateUrl: './my-issues.component.html',
  styleUrls: ['./my-issues.component.scss'],
})
export class MyIssuesComponent implements OnInit {

  // =========================
  // Component Variables
  // =========================

  myIssues: any[] = [];
  loginUser: any = null;

  loading: boolean = false;
  message: string = '';
  isMessage: boolean = false;

  // Category filter
  categories: any[] = [];
  selectedCategory: string = '';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public loader: LoaderService,
    private router: Router,
  ) {
    this.authService.user$.subscribe((user) => {

      this.loginUser = user;

      if (user) {
        this.loadMyIssues(user);
      }
    });
  }

  ngOnInit(): void {

    const state = history.state;

    // Load categories from master API
    this.loadCategories();

    if (state.message) {

      this.message = state.message;
      this.isMessage = true;

      history.replaceState({}, '');

      setTimeout(() => {
        this.isMessage = false;
      }, 3000);
    }
  }

  // =========================
  // Load Categories
  // =========================

  loadCategories(): void {

    this.apiService
      .request(
        'POST',
        '/masterData',
        JSON.stringify({
          master_id: 1,
          mode: 'web',
        })
      )
      .subscribe({

        next: (res: any) => {

          this.categories = res.master_data || [];

          console.log('Categories:', this.categories);
        },

        error: (err: any) => {

          console.error('Category loading failed:', err);

          this.categories = [];
        },
      });
  }

  // =========================
  // Load My Issues
  // =========================

  loadMyIssues(user: any): void {

    this.loader.show();

    const payloadObj: any = {};

    if (user?.userId) {
      payloadObj.created_by = user.userId;
    }

    // Initially load all categories
    payloadObj.category_id = '';

    const payload = JSON.stringify(payloadObj);

    this.apiService
      .request('POST', '/myIssues', payload)
      .subscribe({

        next: (res: any) => {

          this.myIssues = res.my_issues || [];

          console.log('myIssues:', this.myIssues);

          this.loader.hide();

          setTimeout(() => {
            this.initializeDataTable();
          }, 0);
        },

        error: (err: any) => {

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

          this.loader.hide();
        },
      });
  }

  // =========================
  // Category Filter
  // =========================

  onCategoryChange(event: Event): void {

    const selectElement = event.target as HTMLSelectElement;

    this.selectedCategory = selectElement.value;

    this.reloadDataTable();
  }

  // =========================
  // Filter Issues
  // =========================

  filteredIssues(): any[] {

    const category = this.selectedCategory;

    if (!category) {
      return this.myIssues;
    }

    return this.myIssues.filter(
      (issue: any) =>
        String(issue.category_id) === String(category)
    );
  }

  // =========================
  // Initialize DataTable
  // =========================

  initializeDataTable(): void {

    if ($.fn.DataTable.isDataTable('#myIssuesTable')) {

      ($('#myIssuesTable') as any)
        .DataTable()
        .destroy();
    }

    if (this.filteredIssues().length > 0) {

      setTimeout(() => {

        ($('#myIssuesTable') as any).DataTable({
          dom: 'Bfrtip',
          buttons: ['excel', 'pdf'],
          responsive: true,
        });

      }, 0);
    }
  }

  // =========================
  // Edit
  // =========================

  handleEdit(issueObj: any): void {

    this.router.navigate(['/admin/issues/create'], {
      state: {
        issue: issueObj,
        isEdit: true,
      },
    });
  }

  // =========================
  // Delete Confirmation
  // =========================

  confirmDelete(id: string): void {

    if (confirm('Are you sure you want to delete this record?')) {
      this.deleteIssue(id);
    }
  }

  // =========================
  // View
  // =========================

  handleView(id: any): void {

    this.router.navigate(['/admin/issues/view-issue'], {
      state: {
        issueID: id
      },
    });
  }

  // =========================
  // Delete Issue
  // =========================

  deleteIssue(id: string): void {

    const payload = JSON.stringify({
      id: id,
      master_id: '9',
    });

    this.apiService
      .request('POST', '/deleteRecord', payload)
      .subscribe({

        next: (res: any) => {

          this.showMessage(res.message);

          // Remove deleted issue
          this.myIssues = this.myIssues.filter(
            (issue: any) => issue.id !== id
          );

          this.reloadDataTable();
        },

        error: (err: any) => {

          console.error(err);
        },
      });
  }

  // =========================
  // Reload DataTable
  // =========================

  reloadDataTable(): void {

    if ($.fn.DataTable.isDataTable('#myIssuesTable')) {

      ($('#myIssuesTable') as any)
        .DataTable()
        .destroy();
    }

    setTimeout(() => {

      if (this.filteredIssues().length > 0) {

        ($('#myIssuesTable') as any).DataTable({
          dom: 'Bfrtip',
          buttons: ['excel', 'pdf'],
          responsive: true,
        });

      }

    }, 100);
  }

  // =========================
  // Show Message
  // =========================

  showMessage(msg: string): void {

    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}