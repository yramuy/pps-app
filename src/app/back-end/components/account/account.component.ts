import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  profile: any = {};
  message: string = '';
  loading: boolean = false;
  myIssues: any = [];

  profileId: any = null;

  private userSubscription?: Subscription;

  user: any;

  // =========================
  // Biography
  // =========================
  biography: any = {
    fullName: '',
    profilePic: '',
    roleName: '',
    state: '',
    district: '',
    assembly: '',
    mandal: '',
    village: '',
    mobile: '',
    email: '',
    bio_graphy: '',
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // =========================
    // User
    // =========================

    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;

      console.log('Header User:', user);

      // =========================
      // Biography Data
      // =========================

      if (user) {
        this.biography = {
          user_role_id: user.roleId,
          full_name: user.fullName || '',
          user_name: user.username || '',
          aadhar_card_number: user.aadhar_card_number || '',
          registration_date: user.registration_date || '',
          profile_pic: user.profile_pic || '',
          aadhar_document: user.aadhar_document || '',
          roleName: user.roleName || '',
          state_id: user.stateID || '',
          district_id: user.districtID || '',
          assembly_id: user.assemblyID || '',
          mandal_id: user.mandalID || '',
          village_id: user.villageID || '',
          mobile: user.mobile || '',
          location: this.getProfileLocation(user),
          email: user.email || '',
          personal_information: user.personal_information || '',
          about: user.about || '',
          achievements: user.achievements || '',
          areas_of_interest: user.areas_of_interest || '',
        };

        console.log('Biography Data:', this.biography);
      }
    });

    this.loadMyIssues(this.user);
  }

  getProfileLocation(user: any): string {
    return [
      user?.village,
      user?.mandal,
      user?.assembly,
      user?.district,
      user?.state,
    ]
      .filter((value) => value !== null && value !== undefined && value !== '')
      .join(', ');
  }

  // ===================================================== // EDIT PROFILE // =====================================================
  handleEdit(biography: any): void {
    this.router.navigate(['/admin/users/add'], {
      state: { user: biography, isEdit: true },
    });
  }

  // =========================
  // Load My Issues
  // =========================

  loadMyIssues(user: any): void {
    // this.loader.show();

    const payloadObj: any = {};

    if (user?.userId) {
      payloadObj.created_by = user.userId;
    }

    // Initially load all categories
    payloadObj.category_id = '';

    const payload = JSON.stringify(payloadObj);

    this.apiService.request('POST', '/myIssues', payload).subscribe({
      next: (res: any) => {
        this.myIssues = res.my_issues || [];

        console.log('myIssues:', this.myIssues);

        // this.loader.hide();

        // setTimeout(() => {
        //   this.initializeDataTable();
        // }, 0);
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

        // this.loader.hide();
      },
    });
  }
}
