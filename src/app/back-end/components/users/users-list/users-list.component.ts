import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
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
  users: any[] = [];
  roles: any[] = [];

  message: string = '';
  isMessage: boolean = false;

  /*
   * Selected role filter
   */
  selectedRoleId: string = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public loader: LoaderService,
    private router: Router,
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    const state = history.state;

    if (state?.message) {
      this.showMessage(state.message);

      // Clear browser history state
      history.replaceState({}, '', location.pathname);
    }

    /*
     * Load roles for filter dropdown
     */
    this.loadRoles();
  }

  ngAfterViewInit(): void {
    /*
     * DataTable will be initialized after users
     * are loaded from API.
     */
  }

  ngOnDestroy(): void {
    this.destroyDataTable();
  }

  // =====================================================
  // LOAD ROLES
  // =====================================================

  loadRoles(): void {
    this.apiService
      .request(
        'POST',
        '/masterData',
        JSON.stringify({
          master_id: 7,
          mode: 'web',
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.roles = res?.master_data || [];

          /*
           * Load users after roles are loaded.
           */
          this.loadUsers();
        },

        error: (err: any) => {
          console.error('Role loading failed:', err);

          this.roles = [];

          /*
           * Still load users even if roles fail.
           */
          this.loadUsers();
        },
      });
  }

  // =====================================================
  // ROLE CHANGE
  // =====================================================

  onRoleChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;

    this.selectedRoleId = selectElement?.value || '';

    /*
     * Only reload users.
     * No need to reload roles.
     */
    this.loadUsers();
  }

  // =====================================================
  // LOAD USERS
  // =====================================================

  loadUsers(): void {
    this.loader.show();

    /*
     * Destroy existing DataTable before changing
     * the table data.
     */
    this.destroyDataTable();

    const payload = {
      master_id: '8',
      dropdown_id: this.selectedRoleId || '',
      mode: 'web',
    };

    this.apiService
      .request(
        'POST',
        '/dependanceMasterData',
        JSON.stringify(payload),
      )
      .subscribe({
        next: (res: any) => {
          console.log('Users response:', res);

          /*
           * IMPORTANT:
           * Assign API response to users, not roles.
           */
          this.users = res?.dependance_master_data || [];

          this.loader.hide();

          /*
           * Wait for Angular to update the DOM
           * before initializing DataTable.
           */
          setTimeout(() => {
            this.initializeDataTable();
          }, 0);
        },

        error: (err: any) => {
          console.error('User loading failed:', err);

          this.users = [];

          this.loader.hide();

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
        },
      });
  }

  // =====================================================
  // RESET FILTERS
  // =====================================================

  resetFilters(): void {
    this.selectedRoleId = '';

    this.loadUsers();
  }

  // =====================================================
  // ADD USER
  // =====================================================

  handleAdd(): void {
    this.router.navigate(['/admin/users/add']);
  }

  // =====================================================
  // EDIT USER
  // =====================================================

  handleEdit(user: any): void {
    this.router.navigate(['/admin/users/add'], {
      state: {
        user: user,
        isEdit: true,
      },
    });
  }

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  confirmDelete(id: string | number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.deleteUser(id);
    }
  }

  // =====================================================
  // DELETE USER
  // =====================================================

  deleteUser(id: string | number): void {
    this.loader.show();

    const payload = JSON.stringify({
      id: id,
      master_id: '8',
    });

    this.apiService
      .request('POST', '/deleteRecord', payload)
      .subscribe({
        next: (res: any) => {
          this.loader.hide();

          this.showMessage(
            res?.message || 'User deleted successfully',
          );

          /*
           * Remove deleted user from local array.
           * String() handles number/string ID differences.
           */
          this.users = this.users.filter(
            (user: any) => String(user.id) !== String(id),
          );

          /*
           * Reinitialize DataTable after Angular
           * updates the table.
           */
          setTimeout(() => {
            this.initializeDataTable();
          }, 0);
        },

        error: (err: any) => {
          console.error('Delete user failed:', err);

          this.loader.hide();

          if (err?.status === 401) {
            this.showMessage('Token expired');
            this.authService.logout();
          } else if (err?.status === 400) {
            this.showMessage('Invalid request data');
          } else if (err?.status === 500) {
            this.showMessage('Server error. Please try again later');
          } else {
            this.showMessage(
              'Unable to delete user. Please try again later',
            );
          }
        },
      });
  }

  // =====================================================
  // INITIALIZE DATATABLE
  // =====================================================

  initializeDataTable(): void {
    const table = $('#userTable');

    if (!table || table.length === 0) {
      return;
    }

    /*
     * Destroy existing DataTable first.
     */
    this.destroyDataTable();

    /*
     * Do not initialize if there are no users.
     */
    if (!this.users || this.users.length === 0) {
      return;
    }

    table.DataTable({
      dom: 'Bfrtip',

      buttons: [
        'excel',
        'pdf',
      ],

      responsive: true,

      /*
       * Optional settings
       */
      pageLength: 10,

      ordering: true,

      searching: true,

      lengthChange: true,

      autoWidth: false,
    });
  }

  // =====================================================
  // DESTROY DATATABLE
  // =====================================================

  destroyDataTable(): void {
    try {
      if ($.fn.DataTable.isDataTable('#userTable')) {
        $('#userTable').DataTable().clear().destroy();
      }
    } catch (error) {
      console.warn('DataTable destroy failed:', error);
    }
  }

  // =====================================================
  // SHOW MESSAGE
  // =====================================================

  showMessage(msg: string): void {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}