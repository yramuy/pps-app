import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
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

  private pendingApiCalls = 0;
  isLoading = false;

  constructor(private apiService: ApiService) {
    this.loadVIPProfiles();
  }

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

  loadVIPProfiles() {
    this.loading = true;
    const payload = {
      is_token: '0',
    };

    this.requestWithLoader('/vipProfiles', payload).subscribe({
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
