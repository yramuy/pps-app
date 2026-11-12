
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

declare var $: any;

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit, AfterViewInit, OnDestroy {

  // Users and roles
  users: any[] = [];
  roles: any[] = [];

  // Loading and messages
  loading = false;
  isLoading = false;
  message = '';
  isMessage = false;

  // Filters
  selectedRoleId = '';
  selectedLeaderType = '';

  private pendingApiCalls = 0;
  private messageTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public loader: LoaderService,
    private router: Router
  ) {}

  // =====================================
  // INIT
  // =====================================

  ngOnInit(): void {

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

    this.loadRoles();
  }

  ngAfterViewInit(): void {
    // DataTable initializes after users are loaded.
  }

  ngOnDestroy(): void {
    this.destroyDataTable();

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
  }

  // =====================================
  // API REQUEST WITH LOADER
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
  // LOAD ROLES
  // =====================================

  loadRoles(): void {

    const payload = JSON.stringify({
      master_id: 7,
      mode: 'web'
    });

    this.requestWithLoader('/masterData', payload).subscribe({

      next: (res: any) => {

        this.roles = res?.master_data || [];

        this.loadUsers();

      },

      error: (err: any) => {

        console.error('Role loading failed:', err);

        this.roles = [];

        // Load users even if role loading fails.
        this.loadUsers();

      }

    });
  }

  // =====================================
  // ROLE FILTER
  // =====================================

  onRoleChange(event: Event): void {

    const selectElement = event.target as HTMLSelectElement;

    this.selectedRoleId = selectElement?.value || '';

    this.loadUsers();

  }

  // =====================================
  // LEADER TYPE FILTER
  // =====================================

  onLeaderTypeChange(event: Event): void {

    const selectElement = event.target as HTMLSelectElement;

    this.selectedLeaderType = selectElement?.value || '';

    this.loadUsers();

  }

  // =====================================
  // LOAD USERS
  // =====================================

  loadUsers(): void {

    this.destroyDataTable();

    const payload = JSON.stringify({
      master_id: '8',
      dropdown_id: this.selectedRoleId || '',
      leader_type: this.selectedLeaderType || '',
      mode: 'web'
    });

    this.requestWithLoader('/dependanceMasterData', payload).subscribe({

      next: (res: any) => {

        console.log('Users response:', res);

        this.users = res?.dependance_master_data || [];

        setTimeout(() => {
          this.initializeDataTable();
        }, 0);

      },

      error: (err: any) => {

        console.error('User loading failed:', err);

        this.users = [];

        if (err?.status === 401) {

          this.showMessage('Token expired');
          this.authService.logout();

        } else if (err?.status === 400) {

          this.showMessage('Invalid request data');

        } else if (err?.status === 500) {

          this.showMessage('Server error. Please try again later');

        } else {

          this.showMessage('Something went wrong. Please try again later');

        }

      }

    });

  }

  // =====================================
  // RESET FILTERS
  // =====================================

  resetFilters(): void {

    this.selectedRoleId = '';
    this.selectedLeaderType = '';

    this.loadUsers();

  }

  // =====================================
  // ADD USER
  // =====================================

  handleAdd(): void {

    this.router.navigate(['/admin/users/add']);

  }

  // =====================================
  // EDIT USER
  // =====================================

  handleEdit(user: any): void {

    this.router.navigate(['/admin/users/add'], {
      state: {
        user: user,
        isEdit: true
      }
    });

  }

  // =====================================
  // CONFIRM DELETE
  // =====================================

  confirmDelete(id: string | number): void {

    if (confirm('Are you sure you want to delete this record?')) {
      this.deleteUser(id);
    }

  }

  // =====================================
  // DELETE USER
  // =====================================

  deleteUser(id: string | number): void {

    const payload = JSON.stringify({
      id: id,
      master_id: '8'
    });

    this.requestWithLoader('/deleteRecord', payload).subscribe({

      next: (res: any) => {

        this.showMessage(
          res?.message || 'User deleted successfully'
        );

        this.users = this.users.filter(
          (user: any) => String(user.id) !== String(id)
        );

        setTimeout(() => {
          this.initializeDataTable();
        }, 0);

      },

      error: (err: any) => {

        console.error('Delete user failed:', err);

        if (err?.status === 401) {

          this.showMessage('Token expired');
          this.authService.logout();

        } else if (err?.status === 400) {

          this.showMessage('Invalid request data');

        } else if (err?.status === 500) {

          this.showMessage('Server error. Please try again later');

        } else {

          this.showMessage(
            err?.error?.message || 'Unable to delete user. Please try again later'
          );

        }

      }

    });

  }

  // =====================================
  // INITIALIZE DATATABLE
  // =====================================

  initializeDataTable(): void {

    const table = $('#userTable');

    if (!table || table.length === 0) {
      return;
    }

    this.destroyDataTable();

    if (!this.users || this.users.length === 0) {
      return;
    }

    table.DataTable({

      dom: 'Bfrtip',

      buttons: ['excel', 'pdf'],

      responsive: true,

      pageLength: 10,

      ordering: true,

      searching: true,

      lengthChange: true,

      autoWidth: false

    });

  }

  // =====================================
  // DESTROY DATATABLE
  // =====================================

  destroyDataTable(): void {

    try {

      if ($.fn.DataTable.isDataTable('#userTable')) {
        $('#userTable').DataTable().clear().destroy();
      }

    } catch (error) {

      console.warn('DataTable destroy failed:', error);

    }

  }

  // =====================================
  // SHOW MESSAGE
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
