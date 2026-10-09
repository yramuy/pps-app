import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-leader-profile',
  templateUrl: './leader-profile.component.html',
  styleUrls: ['./leader-profile.component.scss'],
})
export class LeaderProfileComponent {
  profile: any = [];
  message: any = '';
  loading: boolean = false;
  profileId: any;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
  ) {
    
  }

  ngOnInit(): void {
    this.profileId = this.route.snapshot.paramMap.get('id');

    console.log('Profile ID:', this.profileId);

    window.scrollTo(0, 0);

    this.loadVIPProfiles();

    
  }

  getProfileLocation(profile: any): string {
  return [
    profile?.village,
    profile?.mandal,
    profile?.assembly,
    profile?.district,
    profile?.state
  ]
    .filter(value => value !== null && value !== undefined && value !== '')
    .join(', ');
}

  loadVIPProfiles() {
    this.loading = true;
    const payload = {
      is_token: '0',
      user_id: this.profileId,
    };

    this.apiService.request('POST', '/userDataById', payload).subscribe({
      next: (res: any) => {
        this.profile = res.data[0] || [];
        this.loading = false;
      },

      error: (err: any) => {
        if (err.status === 400) {
          this.message.set('Invalid request data');
        } else if (err.status === 500) {
          this.message = 'Server error. Please try again later';
        } else {
          this.message = 'Something went wrong. Please try again later';
        }

        this.loading = false;
      },
    });
  }
}
