import {
  Component,
  OnDestroy,
} from '@angular/core';

import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

declare const $: any;

@Component({
  selector: 'app-issues-list',
  templateUrl: './issues-list.component.html',
  styleUrls: ['./issues-list.component.scss'],
})
export class IssuesListComponent implements OnDestroy {

  issuesList: any[] = [];
  loginUser: any = null;
  loading = false;
  message = '';

  categories: any[] = [];
  assemblies: any[] = [];
  mandals: any[] = [];
  villages: any[] = [];

  /*
   * Default values
   */
  selectedCategoryId = '';
  selectedAssemblyId = '';
  selectedMandalId = '';
  selectedVillageId = '';

  private userSubscription?: Subscription;

  // =====================================================
  // ROLE IDS
  // =====================================================

  readonly SUPER_ADMIN_ROLE_ID = 1;
  readonly ADMIN_ROLE_ID = 2;
  readonly MP_ROLE_ID = 3;
  readonly MLA_ROLE_ID = 4;
  readonly SARPANCH_ROLE_ID = 5;
  readonly GUEST_ROLE_ID = 7;

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
        console.log('LOGIN USER:', user);
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
  // INITIALIZE FILTERS
  // =====================================================

  private initializeFilters(): void {
    if (!this.loginUser) {
      return;
    }

    // Reset all selections
    this.selectedCategoryId = '';
    this.selectedAssemblyId = '';
    this.selectedMandalId = '';
    this.selectedVillageId = '';

    this.assemblies = [];
    this.mandals = [];
    this.villages = [];

    // Load Categories
    this.loadCategories();

    // Load Assemblies using login district
    if (this.loginUser.districtID) {
      this.loadAssemblies(this.loginUser.districtID);
    }

    // Load issues initially
    this.loadAllIssues(this.loginUser);
  }

  // =====================================================
  // ROLE CHECKS
  // =====================================================

  isSuperAdmin(): boolean {
    return Number(this.loginUser?.roleId) === this.SUPER_ADMIN_ROLE_ID;
  }

  isAdmin(): boolean {
    return Number(this.loginUser?.roleId) === this.ADMIN_ROLE_ID;
  }

  isMP(): boolean {
    return Number(this.loginUser?.roleId) === this.MP_ROLE_ID;
  }

  isMLA(): boolean {
    return Number(this.loginUser?.roleId) === this.MLA_ROLE_ID;
  }

  isSarpanch(): boolean {
    return Number(this.loginUser?.roleId) === this.SARPANCH_ROLE_ID;
  }

  isGuest(): boolean {
    return Number(this.loginUser?.roleId) === this.GUEST_ROLE_ID;
  }

  // =====================================================
  // FILTER DISABLED CONDITIONS
  // =====================================================

  isCategoryDisabled(): boolean {
    return false;
  }

  isAssemblyDisabled(): boolean {
    return this.isMLA() || this.isSarpanch();
  }

  isMandalDisabled(): boolean {
    return this.isSarpanch();
  }

  isVillageDisabled(): boolean {
    return false;
  }

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

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
        },
        error: (err: any) => {
          console.error('Category loading failed:', err);
          this.categories = [];
        },
      });
  }

  // =====================================================
  // LOAD ASSEMBLIES
  // =====================================================

  loadAssemblies(districtId: any): void {
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
          mode: 'web',
        })
      )
      .subscribe({
        next: (res: any) => {
          this.assemblies = res.dependance_master_data || [];

          // Set default Assembly based on role
          if (this.isSarpanch() || this.isMLA()) {
            this.selectedAssemblyId = String(this.loginUser.assemblyID || '');

            console.log('Default Assembly:', this.selectedAssemblyId);

            // Load Mandals after Assembly is set
            if (this.selectedAssemblyId) {
              this.loadMandals(this.selectedAssemblyId);
            }
          }
          // For other roles (Admin, MP, Super Admin), Assembly stays as 'All' (empty)
        },
        error: (err: any) => {
          console.error('Assembly loading failed:', err);
          this.assemblies = [];
        },
      });
  }

  // =====================================================
  // LOAD MANDALS
  // =====================================================

  loadMandals(assemblyId: any): void {
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
          mode: 'web',
        })
      )
      .subscribe({
        next: (res: any) => {
          this.mandals = res.dependance_master_data || [];

          // Set default Mandal based on role
          if (this.isSarpanch()) {
            this.selectedMandalId = String(this.loginUser.mandalID || '');

            console.log('Default Mandal:', this.selectedMandalId);

            // Load Villages after Mandal is set
            if (this.selectedMandalId) {
              this.loadVillages(this.selectedMandalId);
            }
          }
          // For MLA and other roles, Mandal stays as 'All' (empty)
        },
        error: (err: any) => {
          console.error('Mandal loading failed:', err);
          this.mandals = [];
        },
      });
  }

  // =====================================================
  // LOAD VILLAGES
  // =====================================================

  loadVillages(mandalId: any): void {
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
          mode: 'web',
        })
      )
      .subscribe({
        next: (res: any) => {
          this.villages = res.dependance_master_data || [];

          // Set default Village for Sarpanch
          if (this.isSarpanch()) {
            this.selectedVillageId = String(this.loginUser.villageID || '');

            console.log('Default Village:', this.selectedVillageId);
          }
        },
        error: (err: any) => {
          console.error('Village loading failed:', err);
          this.villages = [];
        },
      });
  }

  // =====================================================
  // CATEGORY CHANGE
  // =====================================================

  onCategoryChange(event: Event): void {
    this.selectedCategoryId = (event.target as HTMLSelectElement).value;
    this.loadAllIssues(this.loginUser);
  }

  // =====================================================
  // ASSEMBLY CHANGE
  // =====================================================

  onAssemblyChange(event: Event): void {
    if (this.isSarpanch() || this.isMLA()) {
      return;
    }

    this.selectedAssemblyId = (event.target as HTMLSelectElement).value;
    this.selectedMandalId = '';
    this.selectedVillageId = '';
    this.mandals = [];
    this.villages = [];

    if (this.selectedAssemblyId) {
      this.loadMandals(this.selectedAssemblyId);
    }

    this.loadAllIssues(this.loginUser);
  }

  // =====================================================
  // MANDAL CHANGE
  // =====================================================

  onMandalChange(event: Event): void {
    if (this.isSarpanch()) {
      return;
    }

    this.selectedMandalId = (event.target as HTMLSelectElement).value;
    this.selectedVillageId = '';
    this.villages = [];

    if (this.selectedMandalId) {
      this.loadVillages(this.selectedMandalId);
    }

    this.loadAllIssues(this.loginUser);
  }

  // =====================================================
  // VILLAGE CHANGE
  // =====================================================

  onVillageChange(event: Event): void {
    this.selectedVillageId = (event.target as HTMLSelectElement).value;
    console.log('Selected Village:', this.selectedVillageId);
    this.loadAllIssues(this.loginUser);
  }

  // =====================================================
  // RESET FILTERS
  // =====================================================

  resetFilters(): void {
    this.selectedCategoryId = '';

    if (this.isSarpanch()) {
      this.selectedAssemblyId = String(this.loginUser?.assemblyID || '');
      this.selectedMandalId = String(this.loginUser?.mandalID || '');
      this.selectedVillageId = String(this.loginUser?.villageID || '');

      if (this.selectedAssemblyId) {
        this.loadMandals(this.selectedAssemblyId);
      }

      this.loadAllIssues(this.loginUser);
      return;
    }

    if (this.isMLA()) {
      this.selectedAssemblyId = String(this.loginUser?.assemblyID || '');
      this.selectedMandalId = '';
      this.selectedVillageId = '';

      if (this.selectedAssemblyId) {
        this.loadMandals(this.selectedAssemblyId);
      }

      this.loadAllIssues(this.loginUser);
      return;
    }

    // Admin / Super Admin / MP
    this.selectedAssemblyId = '';
    this.selectedMandalId = '';
    this.selectedVillageId = '';
    this.mandals = [];
    this.villages = [];

    this.loadAllIssues(this.loginUser);
  }

  // =====================================================
  // LOAD ALL ISSUES
  // =====================================================

  loadAllIssues(user: any): void {
    if (!user) {
      return;
    }

    this.loading = true;
    this.message = '';
    this.loader.show();

    const payloadObj: any = {
      category_id: this.selectedCategoryId || '',
    };

    if (user.stateID) {
      payloadObj.state_id = user.stateID;
    }

    if (user.districtID) {
      payloadObj.district_id = user.districtID;
    }

    if (this.selectedAssemblyId) {
      payloadObj.assembly_id = this.selectedAssemblyId;
    } else if (user.assemblyID) {
      payloadObj.assembly_id = user.assemblyID;
    }

    if (this.selectedMandalId) {
      payloadObj.mandal_id = this.selectedMandalId;
    } else if (user.mandalID) {
      if (!this.isMLA()) {
        payloadObj.mandal_id = user.mandalID;
      }
    }

    if (this.selectedVillageId) {
      payloadObj.village_id = this.selectedVillageId;
    } else if (user.villageID) {
      if (this.isSarpanch() && this.selectedVillageId === '') {
        // Do not force login village here
      }
    }

    const payload = JSON.stringify(payloadObj);
    console.log('All Issues Payload:', payload);

    this.apiService
      .request('POST', '/allIssues', payload)
      .subscribe({
        next: (res: any) => {
          this.issuesList = res.all_issues || [];
          this.loading = false;
          this.loader.hide();
          this.refreshDataTable();
        },
        error: (err: any) => {
          console.error('All Issues Error:', err);

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

          this.loading = false;
          this.loader.hide();
          this.destroyDataTable();
        },
      });
  }

  // =====================================================
  // DATATABLE
  // =====================================================

  private refreshDataTable(): void {
    this.destroyDataTable();

    setTimeout(() => {
      if (
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