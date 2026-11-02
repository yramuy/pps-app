import { Component, OnDestroy, signal } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-assigned-to-me-issues',
  templateUrl: './assigned-to-me-issues.component.html',
  styleUrls: ['./assigned-to-me-issues.component.scss'],
})
export class AssignedToMeIssuesComponent implements OnDestroy {
  // =========================================================
  // Signals
  // =========================================================

  assignedToMeIssues = signal<any[]>([]);
  loginUser = signal<any>(null);

  loading = signal(false);
  message = signal('');

  // =========================================================
  // Dropdown Data
  // =========================================================

  categories: any[] = [];
  assemblies: any[] = [];
  mandals: any[] = [];
  villages: any[] = [];

  // =========================================================
  // Selected Filters
  // =========================================================

  selectedCategoryId = '';
  selectedAssemblyId = '';
  selectedMandalId = '';
  selectedVillageId = '';

  // =========================================================
  // Subscription
  // =========================================================

  private userSubscription?: Subscription;
  private pendingApiCalls = 0;

  isLoading = false;

  // =========================================================
  // Role IDs
  // =========================================================

  readonly SUPER_ADMIN_ROLE_ID = 1;
  readonly ADMIN_ROLE_ID = 2;
  readonly MP_ROLE_ID = 3;
  readonly MLA_ROLE_ID = 4;
  readonly SARPANCH_ROLE_ID = 5;
  readonly GUEST_ROLE_ID = 7;

  // =========================================================
  // Constructor
  // =========================================================

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public loader: LoaderService,
    private router: Router,
    private notificationService: NotificationService,
  ) {
    this.userSubscription = this.authService.user$.subscribe({
      next: (user: any) => {
        console.log('LOGIN USER:', user);

        this.loginUser.set(user);

        if (!user) {
          return;
        }

        // Set login user's default location
        this.setLoginLocationFilters(user);

        // Load Categories
        this.loadCategories();

        // Load Assembly hierarchy
        if (user.districtID) {
          this.loadAssemblies(user.districtID);
        } else {
          this.loadAssignedToMeIssues(user);
        }
      },

      error: (err: any) => {
        console.error('User subscription error:', err);
      },
    });
  }

  // =========================================================
  // API Request With Loader
  // =========================================================

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

  // =========================================================
  // Set Login Location Filters
  // =========================================================

  private setLoginLocationFilters(user: any): void {
    this.selectedAssemblyId = user?.assemblyID ? String(user.assemblyID) : '';

    this.selectedMandalId = user?.mandalID ? String(user.mandalID) : '';

    this.selectedVillageId = user?.villageID ? String(user.villageID) : '';

    console.log('LOGIN LOCATION FILTERS:', {
      assemblyID: this.selectedAssemblyId,
      mandalID: this.selectedMandalId,
      villageID: this.selectedVillageId,
    });
  }

  // =========================================================
  // Role Checks
  // =========================================================

  isSuperAdmin(): boolean {
    return Number(this.loginUser()?.roleId) === this.SUPER_ADMIN_ROLE_ID;
  }

  isAdmin(): boolean {
    return Number(this.loginUser()?.roleId) === this.ADMIN_ROLE_ID;
  }

  isMP(): boolean {
    return Number(this.loginUser()?.roleId) === this.MP_ROLE_ID;
  }

  isMLA(): boolean {
    return Number(this.loginUser()?.roleId) === this.MLA_ROLE_ID;
  }

  isSarpanch(): boolean {
    return Number(this.loginUser()?.roleId) === this.SARPANCH_ROLE_ID;
  }

  isGuest(): boolean {
    return Number(this.loginUser()?.roleId) === this.GUEST_ROLE_ID;
  }

  // =========================================================
  // Filter Disabled Conditions
  // =========================================================

  isCategoryDisabled(): boolean {
    return false;
  }

  isAssemblyDisabled(): boolean {
    return this.isMLA() || this.isSarpanch() || this.isGuest();
  }

  isMandalDisabled(): boolean {
    return this.isSarpanch() || this.isGuest();
  }

  isVillageDisabled(): boolean {
    return this.isGuest();
  }

  // =========================================================
  // Load Categories
  // API: /masterData
  // master_id = 1
  // =========================================================

  loadCategories(): void {
    this.requestWithLoader(
      '/masterData',
      JSON.stringify({
        master_id: 1,
        mode: 'web',
      }),
    ).subscribe({
      next: (res: any) => {
        this.categories = res.master_data || [];
      },

      error: (err: any) => {
        console.error('Category loading failed:', err);
        this.categories = [];
      },
    });
  }

  // =========================================================
  // Load Assemblies
  // API: /dependanceMasterData
  // master_id = 4
  // =========================================================

  loadAssemblies(districtId: any): void {
    this.assemblies = [];
    this.mandals = [];
    this.villages = [];

    if (!districtId) {
      this.loadAssignedToMeIssues(this.loginUser());
      return;
    }

    this.requestWithLoader(
      '/dependanceMasterData',
      JSON.stringify({
        master_id: 4,
        dropdown_id: districtId,
        mode: 'web',
      }),
    ).subscribe({
      next: (res: any) => {
        this.assemblies = res.dependance_master_data || [];

        const user = this.loginUser();

        // Restore login user's Assembly during initial load/reset
        if (user?.assemblyID) {
          this.selectedAssemblyId = String(user.assemblyID);

          this.loadMandals(this.selectedAssemblyId, true);
        } else {
          this.selectedAssemblyId = '';
          this.selectedMandalId = '';
          this.selectedVillageId = '';

          this.loadAssignedToMeIssues(user);
        }
      },

      error: (err: any) => {
        console.error('Assembly loading failed:', err);

        this.assemblies = [];
        this.loadAssignedToMeIssues(this.loginUser());
      },
    });
  }

  // =========================================================
  // Load Mandals
  // API: /dependanceMasterData
  // master_id = 5
  //
  // restoreLoginSelection:
  // true  = Initial load/reset
  // false = User manually changed Assembly
  // =========================================================

  loadMandals(assemblyId: any, restoreLoginSelection: boolean = true): void {
    this.mandals = [];
    this.villages = [];

    if (!assemblyId) {
      this.selectedMandalId = '';
      this.selectedVillageId = '';

      this.loadAssignedToMeIssues(this.loginUser());

      return;
    }

    this.requestWithLoader(
      '/dependanceMasterData',
      JSON.stringify({
        master_id: 5,
        dropdown_id: assemblyId,
        mode: 'web',
      }),
    ).subscribe({
      next: (res: any) => {
        this.mandals = res.dependance_master_data || [];

        const user = this.loginUser();

        if (restoreLoginSelection && user?.mandalID) {
          // Restore login user's Mandal
          this.selectedMandalId = String(user.mandalID);

          this.loadVillages(this.selectedMandalId, true);
        } else {
          // Do not restore old Mandal after Assembly change
          this.selectedMandalId = '';
          this.selectedVillageId = '';

          this.loadAssignedToMeIssues(user);
        }
      },

      error: (err: any) => {
        console.error('Mandal loading failed:', err);

        this.mandals = [];
        this.loadAssignedToMeIssues(this.loginUser());
      },
    });
  }

  // =========================================================
  // Load Villages
  // API: /dependanceMasterData
  // master_id = 6
  //
  // restoreLoginSelection:
  // true  = Initial load/reset
  // false = User manually changed Mandal
  // =========================================================

  loadVillages(mandalId: any, restoreLoginSelection: boolean = true): void {
    this.villages = [];

    if (!mandalId) {
      this.selectedVillageId = '';

      this.loadAssignedToMeIssues(this.loginUser());

      return;
    }

    this.requestWithLoader(
      '/dependanceMasterData',
      JSON.stringify({
        master_id: 6,
        dropdown_id: mandalId,
        mode: 'web',
      }),
    ).subscribe({
      next: (res: any) => {
        this.villages = res.dependance_master_data || [];

        const user = this.loginUser();

        if (restoreLoginSelection && user?.villageID) {
          // Restore login user's Village
          this.selectedVillageId = String(user.villageID);
        } else {
          // Do not restore old Village after Mandal change
          this.selectedVillageId = '';
        }

        this.loadAssignedToMeIssues(user);
      },

      error: (err: any) => {
        console.error('Village loading failed:', err);

        this.villages = [];

        this.loadAssignedToMeIssues(this.loginUser());
      },
    });
  }

  // =========================================================
  // Category Filter
  // =========================================================

  onCategoryChange(event: Event): void {
    this.selectedCategoryId = (event.target as HTMLSelectElement).value;

    console.log('Selected Category:', this.selectedCategoryId);

    this.loadAssignedToMeIssues(this.loginUser());
  }

  // =========================================================
  // Assembly Filter
  // =========================================================

  onAssemblyChange(event: Event): void {
    if (this.isAssemblyDisabled()) {
      const user = this.loginUser();

      this.selectedAssemblyId = user?.assemblyID ? String(user.assemblyID) : '';

      return;
    }

    this.selectedAssemblyId = (event.target as HTMLSelectElement).value;

    // Reset dependent filters
    this.selectedMandalId = '';
    this.selectedVillageId = '';

    this.mandals = [];
    this.villages = [];

    console.log('Selected Assembly:', this.selectedAssemblyId);

    if (this.selectedAssemblyId) {
      // Important: Do not restore login user's Mandal
      this.loadMandals(this.selectedAssemblyId, false);
    } else {
      this.loadAssignedToMeIssues(this.loginUser());
    }
  }

  // =========================================================
  // Mandal Filter
  // =========================================================

  onMandalChange(event: Event): void {
    if (this.isMandalDisabled()) {
      const user = this.loginUser();

      this.selectedMandalId = user?.mandalID ? String(user.mandalID) : '';

      return;
    }

    this.selectedMandalId = (event.target as HTMLSelectElement).value;

    // Reset Village
    this.selectedVillageId = '';
    this.villages = [];

    console.log('Selected Mandal:', this.selectedMandalId);

    if (this.selectedMandalId) {
      // Important: Do not restore login user's Village
      this.loadVillages(this.selectedMandalId, false);
    } else {
      this.loadAssignedToMeIssues(this.loginUser());
    }
  }

  // =========================================================
  // Village Filter
  // =========================================================

  onVillageChange(event: Event): void {
    if (this.isVillageDisabled()) {
      const user = this.loginUser();

      this.selectedVillageId = user?.villageID ? String(user.villageID) : '';

      return;
    }

    this.selectedVillageId = (event.target as HTMLSelectElement).value;

    console.log('Selected Village:', this.selectedVillageId);

    this.loadAssignedToMeIssues(this.loginUser());
  }

  // =========================================================
  // Reset Filters
  // =========================================================

  resetFilters(): void {
    const user = this.loginUser();

    if (!user) {
      return;
    }

    // Reset Category
    this.selectedCategoryId = '';

    // Restore login user's location
    this.selectedAssemblyId = user?.assemblyID ? String(user.assemblyID) : '';

    this.selectedMandalId = user?.mandalID ? String(user.mandalID) : '';

    this.selectedVillageId = user?.villageID ? String(user.villageID) : '';

    console.log('RESET FILTERS:', {
      category: this.selectedCategoryId,
      assembly: this.selectedAssemblyId,
      mandal: this.selectedMandalId,
      village: this.selectedVillageId,
    });

    // Reload dropdown hierarchy
    if (user?.districtID) {
      this.loadAssemblies(user.districtID);
    } else {
      this.loadAssignedToMeIssues(user);
    }
  }

  // =========================================================
  // Load Assigned To Me Issues
  // API: /assignedToMeIssues
  // =========================================================

  loadAssignedToMeIssues(user: any): void {
    if (!user) {
      return;
    }

    this.loading.set(true);
    this.message.set('');

    // Build API payload
    const payloadObj: any = {};

    // Assigned User
    if (user?.userId) {
      payloadObj.assigned_to = user.userId;
    }

    // Category
    payloadObj.category_id = this.selectedCategoryId || '';

    // State
    if (user?.stateID) {
      payloadObj.state_id = user.stateID;
    }

    // District
    if (user?.districtID) {
      payloadObj.district_id = user.districtID;
    }

    // Assembly - use only selected value
    if (this.selectedAssemblyId) {
      payloadObj.assembly_id = this.selectedAssemblyId;
    }

    // Mandal - use only selected value
    if (this.selectedMandalId) {
      payloadObj.mandal_id = this.selectedMandalId;
    }

    // Village - use only selected value
    if (this.selectedVillageId) {
      payloadObj.village_id = this.selectedVillageId;
    }

    const payload = JSON.stringify(payloadObj);

    console.log('Assigned To Me Payload:', payload);

    this.requestWithLoader('/assignedToMeIssues', payload).subscribe({
      next: (res: any) => {
        const issues = res.assignedToMe_issues || [];

        this.assignedToMeIssues.set(issues);

        this.notificationService.setNotificationCount(issues);

        console.log('Assigned To Me Issues:', issues);

        // Image field debugging
        if (issues.length > 0) {
          console.log('ASSIGNED ISSUE IMAGE DATA:', issues[0]);
        }

        this.loading.set(false);
      },

      error: (err: any) => {
        console.error('Assigned issues loading failed:', err);

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

        this.assignedToMeIssues.set([]);
        this.loading.set(false);
      },
    });
  }

  // =========================================================
  // Get Issue Image
  // =========================================================

  getIssueImage(issue: any): string | null {
    if (!issue?.issue_pic) {
      return null;
    }

    return issue.issue_pic;
  }

  // =========================================================
  // Image Error
  // =========================================================

  onIssueImageError(event: Event, issue: any): void {
    issue.imageLoadError = true;

    console.error('Issue image failed to load:', issue);
  }

  // =========================================================
  // View Issue
  // =========================================================

  handleView(id: any): void {
    this.router.navigate(['/admin/issues/view-issue'], {
      state: {
        issueID: id,
      },
    });
  }

  // =========================================================
  // Cleanup
  // =========================================================

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
