import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-vip-profiles',
  templateUrl: './vip-profiles.component.html',
  styleUrls: ['./vip-profiles.component.scss'],
})
export class VipProfilesComponent {
  profiles: any = [];
  message: any = '';
  loading: boolean = false;

  constructor(private apiService: ApiService) {
    this.loadVIPProfiles();
  }

  loadVIPProfiles() {
    this.loading = true;
    const payload = {
      is_token: '0',
    };

    this.apiService.request('POST', '/vipProfiles', payload).subscribe({
      next: (res: any) => {
        this.profiles = res.data || [];
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
