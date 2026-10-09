import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-leader-biography',
  templateUrl: './leader-biography.component.html',
  styleUrls: ['./leader-biography.component.scss'],
})
export class LeaderBiographyComponent implements OnInit {
  profile: any = {};
  message: string = '';
  loading: boolean = false;

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

  constructor(private authService: AuthService) {}

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
          fullName: user.fullName || '',
          profilePic: user.profile_pic || '',
          roleName: user.roleName || '',
          state: user.state || '',
          district: user.district || '',
          assembly: user.assembly || '',
          mandal: user.mandal || '',
          village: user.village || '',
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
}
