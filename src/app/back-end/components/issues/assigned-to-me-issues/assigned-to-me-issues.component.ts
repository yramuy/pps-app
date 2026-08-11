
import {
  Component,
  OnDestroy,
  signal
} from '@angular/core';

import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

declare const $: any;

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
  // Dropdown data
  // =========================================================

  categories: any[] = [];
  assemblies: any[] = [];
  mandals: any[] = [];
  villages: any[] = [];

  // =========================================================
  // Selected filters
  // =========================================================

  selectedCategoryId = '';
  selectedAssemblyId = '';
  selectedMandalId = '';
  selectedVillageId = '';

  // =========================================================
  // Subscription
  // =========================================================

  private userSubscription?: Subscription;

  // =========================================================
  // ROLE IDS
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
    private router: Router
  ) {

    // =======================================================
    // Get logged-in user
    // =======================================================

    this.userSubscription =
      this.authService.user$.subscribe({

        next: (user: any) => {

          console.log(
            'LOGIN USER:',
            user
          );

          this.loginUser.set(user);

          if (!user) {
            return;
          }

          // -------------------------------------------------
          // Set login user's location
          // -------------------------------------------------

          this.setLoginLocationFilters(user);

          // -------------------------------------------------
          // Load Categories
          // -------------------------------------------------

          this.loadCategories();

          // -------------------------------------------------
          // Load Assemblies based on District
          // -------------------------------------------------

          if (user.districtID) {

            this.loadAssemblies(
              user.districtID
            );

          } else {

            this.loadAssignedToMeIssues(
              user
            );

          }

        },

        error: (err: any) => {

          console.error(
            'User subscription error:',
            err
          );

        }

      });

  }

  // =========================================================
  // Set Login Location Filters
  // =========================================================

  private setLoginLocationFilters(
    user: any
  ): void {

    this.selectedAssemblyId =
      user?.assemblyID
        ? String(user.assemblyID)
        : '';

    this.selectedMandalId =
      user?.mandalID
        ? String(user.mandalID)
        : '';

    this.selectedVillageId =
      user?.villageID
        ? String(user.villageID)
        : '';

    console.log(
      'LOGIN LOCATION FILTERS:',
      {
        assemblyID: this.selectedAssemblyId,
        mandalID: this.selectedMandalId,
        villageID: this.selectedVillageId
      }
    );
  }

  // =========================================================
  // ROLE CHECKS
  // =========================================================

  isSuperAdmin(): boolean {

    return Number(
      this.loginUser()?.roleId
    ) === this.SUPER_ADMIN_ROLE_ID;

  }

  isAdmin(): boolean {

    return Number(
      this.loginUser()?.roleId
    ) === this.ADMIN_ROLE_ID;

  }

  isMP(): boolean {

    return Number(
      this.loginUser()?.roleId
    ) === this.MP_ROLE_ID;

  }

  isMLA(): boolean {

    return Number(
      this.loginUser()?.roleId
    ) === this.MLA_ROLE_ID;

  }

  isSarpanch(): boolean {

    return Number(
      this.loginUser()?.roleId
    ) === this.SARPANCH_ROLE_ID;

  }

  isGuest(): boolean {

    return Number(
      this.loginUser()?.roleId
    ) === this.GUEST_ROLE_ID;

  }

  // =========================================================
  // FILTER DISABLED CONDITIONS
  // =========================================================

  // Category is always enabled
  isCategoryDisabled(): boolean {

    return false;

  }

  // ---------------------------------------------------------
  // Assembly
  //
  // Super Admin -> Enabled
  // Admin       -> Enabled
  // MP          -> Enabled
  // MLA         -> Disabled
  // Sarpanch    -> Disabled
  // Guest       -> Disabled
  // ---------------------------------------------------------

  isAssemblyDisabled(): boolean {

    return (
      this.isMLA() ||
      this.isSarpanch() ||
      this.isGuest()
    );

  }

  // ---------------------------------------------------------
  // Mandal
  //
  // Super Admin -> Enabled
  // Admin       -> Enabled
  // MP          -> Enabled
  // MLA         -> Enabled
  // Sarpanch    -> Disabled
  // Guest       -> Disabled
  // ---------------------------------------------------------

  isMandalDisabled(): boolean {

    return (
      this.isSarpanch() ||
      this.isGuest()
    );

  }

  // ---------------------------------------------------------
  // Village
  //
  // Super Admin -> Enabled
  // Admin       -> Enabled
  // MP          -> Enabled
  // MLA         -> Enabled
  // Sarpanch    -> Enabled
  // Guest       -> Disabled
  // ---------------------------------------------------------

  isVillageDisabled(): boolean {

    return this.isGuest();

  }

  // =========================================================
  // Load Categories
  // API: /masterData
  // master_id = 1
  // =========================================================

  loadCategories(): void {

    this.apiService
      .request(
        'POST',
        '/masterData',
        JSON.stringify({
          master_id: 1,
          mode: 'web'
        })
      )
      .subscribe({

        next: (res: any) => {

          this.categories =
            res.master_data || [];

        },

        error: (err: any) => {

          console.error(
            'Category loading failed:',
            err
          );

          this.categories = [];

        }

      });

  }

  // =========================================================
  // Load Assemblies
  // API: /dependanceMasterData
  // master_id = 4
  // =========================================================

  loadAssemblies(
    districtId: any
  ): void {

    // -------------------------------------------------------
    // Clear dropdown arrays.
    //
    // DO NOT clear selected IDs here.
    // -------------------------------------------------------

    this.assemblies = [];
    this.mandals = [];
    this.villages = [];

    if (!districtId) {

      return;

    }

    this.apiService
      .request(
        'POST',
        '/dependanceMasterData',
        JSON.stringify({
          master_id: 4,
          dropdown_id: districtId,
          mode: 'web'
        })
      )
      .subscribe({

        next: (res: any) => {

          this.assemblies =
            res.dependance_master_data || [];

          const user =
            this.loginUser();

          // -------------------------------------------------
          // Restore login user's Assembly
          // -------------------------------------------------

          if (user?.assemblyID) {

            this.selectedAssemblyId =
              String(user.assemblyID);

            console.log(
              'Login Assembly:',
              this.selectedAssemblyId
            );

            // ------------------------------------------------
            // Load Mandals
            // ------------------------------------------------

            this.loadMandals(
              this.selectedAssemblyId
            );

          } else {

            this.selectedAssemblyId = '';
            this.selectedMandalId = '';
            this.selectedVillageId = '';

            this.loadAssignedToMeIssues(
              user
            );

          }

        },

        error: (err: any) => {

          console.error(
            'Assembly loading failed:',
            err
          );

          this.assemblies = [];

        }

      });

  }

  // =========================================================
  // Load Mandals
  // API: /dependanceMasterData
  // master_id = 5
  // =========================================================

  loadMandals(
    assemblyId: any
  ): void {

    this.mandals = [];
    this.villages = [];

    if (!assemblyId) {

      this.selectedMandalId = '';
      this.selectedVillageId = '';

      return;

    }

    this.apiService
      .request(
        'POST',
        '/dependanceMasterData',
        JSON.stringify({
          master_id: 5,
          dropdown_id: assemblyId,
          mode: 'web'
        })
      )
      .subscribe({

        next: (res: any) => {

          this.mandals =
            res.dependance_master_data || [];

          const user =
            this.loginUser();

          // -------------------------------------------------
          // Restore login user's Mandal
          // -------------------------------------------------

          if (user?.mandalID) {

            this.selectedMandalId =
              String(user.mandalID);

            console.log(
              'Login Mandal:',
              this.selectedMandalId
            );

            // ------------------------------------------------
            // Load Villages
            // ------------------------------------------------

            this.loadVillages(
              this.selectedMandalId
            );

          } else {

            this.selectedMandalId = '';
            this.selectedVillageId = '';

            this.loadAssignedToMeIssues(
              user
            );

          }

        },

        error: (err: any) => {

          console.error(
            'Mandal loading failed:',
            err
          );

          this.mandals = [];

        }

      });

  }

  // =========================================================
  // Load Villages
  // API: /dependanceMasterData
  // master_id = 6
  // =========================================================

  loadVillages(
    mandalId: any
  ): void {

    this.villages = [];

    if (!mandalId) {

      this.selectedVillageId = '';

      return;

    }

    this.apiService
      .request(
        'POST',
        '/dependanceMasterData',
        JSON.stringify({
          master_id: 6,
          dropdown_id: mandalId,
          mode: 'web'
        })
      )
      .subscribe({

        next: (res: any) => {

          this.villages =
            res.dependance_master_data || [];

          const user =
            this.loginUser();

          // -------------------------------------------------
          // Restore login user's Village
          // -------------------------------------------------

          if (user?.villageID) {

            this.selectedVillageId =
              String(user.villageID);

            console.log(
              'Login Village:',
              this.selectedVillageId
            );

          } else {

            this.selectedVillageId = '';

          }

          // -------------------------------------------------
          // All dropdowns loaded.
          // Now load issues.
          // -------------------------------------------------

          this.loadAssignedToMeIssues(
            user
          );

        },

        error: (err: any) => {

          console.error(
            'Village loading failed:',
            err
          );

          this.villages = [];

          this.loadAssignedToMeIssues(
            this.loginUser()
          );

        }

      });

  }

  // =========================================================
  // Category Filter
  // =========================================================

  onCategoryChange(
    event: Event
  ): void {

    this.selectedCategoryId =
      (
        event.target as HTMLSelectElement
      ).value;

    console.log(
      'Selected Category:',
      this.selectedCategoryId
    );

    this.loadAssignedToMeIssues(
      this.loginUser()
    );

  }

  // =========================================================
  // Assembly Filter
  // =========================================================

  onAssemblyChange(
    event: Event
  ): void {

    // -------------------------------------------------------
    // Role protection
    // -------------------------------------------------------

    if (this.isAssemblyDisabled()) {

      // Restore login value
      const user =
        this.loginUser();

      this.selectedAssemblyId =
        user?.assemblyID
          ? String(user.assemblyID)
          : '';

      return;
    }

    // -------------------------------------------------------
    // Selected Assembly
    // -------------------------------------------------------

    this.selectedAssemblyId =
      (
        event.target as HTMLSelectElement
      ).value;

    // -------------------------------------------------------
    // Reset dependent filters
    // -------------------------------------------------------

    this.selectedMandalId = '';
    this.selectedVillageId = '';

    this.mandals = [];
    this.villages = [];

    console.log(
      'Selected Assembly:',
      this.selectedAssemblyId
    );

    // -------------------------------------------------------
    // Load Mandals
    // -------------------------------------------------------

    if (this.selectedAssemblyId) {

      this.loadMandals(
        this.selectedAssemblyId
      );

    } else {

      this.loadAssignedToMeIssues(
        this.loginUser()
      );

    }

  }

  // =========================================================
  // Mandal Filter
  // =========================================================

  onMandalChange(
    event: Event
  ): void {

    // -------------------------------------------------------
    // Role protection
    // -------------------------------------------------------

    if (this.isMandalDisabled()) {

      const user =
        this.loginUser();

      this.selectedMandalId =
        user?.mandalID
          ? String(user.mandalID)
          : '';

      return;
    }

    // -------------------------------------------------------
    // Selected Mandal
    // -------------------------------------------------------

    this.selectedMandalId =
      (
        event.target as HTMLSelectElement
      ).value;

    // -------------------------------------------------------
    // Reset Village
    // -------------------------------------------------------

    this.selectedVillageId = '';

    this.villages = [];

    console.log(
      'Selected Mandal:',
      this.selectedMandalId
    );

    // -------------------------------------------------------
    // Load Villages
    // -------------------------------------------------------

    if (this.selectedMandalId) {

      this.loadVillages(
        this.selectedMandalId
      );

    } else {

      this.loadAssignedToMeIssues(
        this.loginUser()
      );

    }

  }

  // =========================================================
  // Village Filter
  // =========================================================

  onVillageChange(
    event: Event
  ): void {

    // -------------------------------------------------------
    // Role protection
    // -------------------------------------------------------

    if (this.isVillageDisabled()) {

      const user =
        this.loginUser();

      this.selectedVillageId =
        user?.villageID
          ? String(user.villageID)
          : '';

      return;
    }

    // -------------------------------------------------------
    // Selected Village
    // -------------------------------------------------------

    this.selectedVillageId =
      (
        event.target as HTMLSelectElement
      ).value;

    console.log(
      'Selected Village:',
      this.selectedVillageId
    );

    this.loadAssignedToMeIssues(
      this.loginUser()
    );

  }

  // =========================================================
  // Reset Filters
  // =========================================================

  resetFilters(): void {

    const user =
      this.loginUser();

    // -------------------------------------------------------
    // Category = All
    // -------------------------------------------------------

    this.selectedCategoryId = '';

    // -------------------------------------------------------
    // IMPORTANT:
    // Always restore login location.
    // -------------------------------------------------------

    this.selectedAssemblyId =
      user?.assemblyID
        ? String(user.assemblyID)
        : '';

    this.selectedMandalId =
      user?.mandalID
        ? String(user.mandalID)
        : '';

    this.selectedVillageId =
      user?.villageID
        ? String(user.villageID)
        : '';

    // -------------------------------------------------------
    // Clear dropdown arrays
    // -------------------------------------------------------

    this.assemblies = [];
    this.mandals = [];
    this.villages = [];

    console.log(
      'RESET FILTERS:',
      {
        category: this.selectedCategoryId,
        assembly: this.selectedAssemblyId,
        mandal: this.selectedMandalId,
        village: this.selectedVillageId
      }
    );

    // -------------------------------------------------------
    // Reload hierarchy
    // -------------------------------------------------------

    if (user?.districtID) {

      this.loadAssemblies(
        user.districtID
      );

    } else {

      this.loadAssignedToMeIssues(
        user
      );

    }

  }

  // =========================================================
  // Load Assigned To Me Issues
  // API: /assignedToMeIssues
  // =========================================================

  loadAssignedToMeIssues(
    user: any
  ): void {

    if (!user) {

      return;

    }

    this.loading.set(true);
    this.message.set('');

    this.loader.show();

    // =======================================================
    // Build API payload
    // =======================================================

    const payloadObj: any = {};

    // -------------------------------------------------------
    // Assigned User
    // -------------------------------------------------------

    if (user?.userId) {

      payloadObj.assigned_to =
        user.userId;

    }

    // -------------------------------------------------------
    // Category
    // -------------------------------------------------------

    payloadObj.category_id =
      this.selectedCategoryId || '';

    // =======================================================
    // State
    // =======================================================

    if (user?.stateID) {

      payloadObj.state_id =
        user.stateID;

    }

    // =======================================================
    // District
    // =======================================================

    if (user?.districtID) {

      payloadObj.district_id =
        user.districtID;

    }

    // =======================================================
    // Assembly
    // =======================================================

    if (this.selectedAssemblyId) {

      payloadObj.assembly_id =
        this.selectedAssemblyId;

    } else if (user?.assemblyID) {

      payloadObj.assembly_id =
        user.assemblyID;

    }

    // =======================================================
    // Mandal
    // =======================================================

    if (this.selectedMandalId) {

      payloadObj.mandal_id =
        this.selectedMandalId;

    } else if (user?.mandalID) {

      payloadObj.mandal_id =
        user.mandalID;

    }

    // =======================================================
    // Village
    // =======================================================

    if (this.selectedVillageId) {

      payloadObj.village_id =
        this.selectedVillageId;

    } else if (user?.villageID) {

      payloadObj.village_id =
        user.villageID;

    }

    // =======================================================
    // JSON Payload
    // =======================================================

    const payload =
      JSON.stringify(payloadObj);

    console.log(
      'Assigned To Me Payload:',
      payload
    );

    // =======================================================
    // API Request
    // =======================================================

    this.apiService
      .request(
        'POST',
        '/assignedToMeIssues',
        payload
      )
      .subscribe({

        // ===================================================
        // Success
        // ===================================================

        next: (res: any) => {

          this.assignedToMeIssues.set(
            res.assignedToMe_issues || []
          );

          console.log(
            'assignedToMeIssues:',
            this.assignedToMeIssues()
          );

          this.loading.set(false);

          this.loader.hide();

          this.refreshDataTable();

        },

        // ===================================================
        // Error
        // ===================================================

        error: (err: any) => {

          console.error(
            'Assigned issues loading failed:',
            err
          );

          if (err.status === 401) {

            this.message.set(
              'Token expired'
            );

            this.authService.logout();

          } else if (err.status === 400) {

            this.message.set(
              'Invalid request data'
            );

          } else if (err.status === 500) {

            this.message.set(
              'Server error. Please try again later'
            );

          } else {

            this.message.set(
              'Something went wrong. Please try again later'
            );

          }

          this.loading.set(false);

          this.loader.hide();

          this.destroyDataTable();

        }

      });

  }

  // =========================================================
  // Refresh DataTable
  // =========================================================

  private refreshDataTable(): void {

    this.destroyDataTable();

    setTimeout(() => {

      if (
        this.assignedToMeIssues().length > 0 &&
        typeof $ !== 'undefined' &&
        $.fn.DataTable &&
        !$.fn.DataTable.isDataTable(
          '#assignedToMeIssuesTable'
        )
      ) {

        ($('#assignedToMeIssuesTable') as any)
          .DataTable({

            dom: 'Bfrtip',

            buttons: [
              'excel',
              'pdf'
            ],

            responsive: true

          });

      }

    }, 0);

  }

  // =========================================================
  // Destroy DataTable
  // =========================================================

  private destroyDataTable(): void {

    if (
      typeof $ !== 'undefined' &&
      $.fn.DataTable &&
      $.fn.DataTable.isDataTable(
        '#assignedToMeIssuesTable'
      )
    ) {

      ($('#assignedToMeIssuesTable') as any)
        .DataTable()
        .destroy();

    }

  }

  // =========================================================
  // View Issue
  // =========================================================

  handleView(
    id: any
  ): void {

    this.router.navigate(
      [
        '/admin/issues/view-issue'
      ],
      {
        state: {
          issueID: id
        }
      }
    );

  }

  // =========================================================
  // Cleanup
  // =========================================================

  ngOnDestroy(): void {

    this.userSubscription?.unsubscribe();

    this.destroyDataTable();

  }

}