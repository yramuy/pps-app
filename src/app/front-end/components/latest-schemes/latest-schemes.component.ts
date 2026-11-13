
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-latest-schemes',
  templateUrl: './latest-schemes.component.html',
  styleUrls: ['./latest-schemes.component.scss']
})
export class LatestSchemesComponent {
  schemes: any[] = [];
  isLoading = false;

  private pendingApiCalls = 0;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loadLatestSchemes();
  }

  private requestWithLoader(endpoint: string, payload: any): any {
    this.pendingApiCalls++;
    this.isLoading = true;

    return this.apiService.request('POST', endpoint, payload).pipe(
      finalize(() => {
        this.pendingApiCalls = Math.max(0, this.pendingApiCalls - 1);
        this.isLoading = this.pendingApiCalls > 0;
      })
    );
  }

  loadLatestSchemes(): void {
    const payload = {
      mode: '0'
    };

    this.requestWithLoader('/topFiveSchemes', payload).subscribe({
      next: (res: any) => {
        this.schemes = res?.topFive_schemes || [];
      },
      error: (err: any) => {
        if (err.status === 401) {
          this.authService.logout();
        } else {
          console.error('Failed to load schemes:', err);
        }
      }
    });
  }

  viewScheme(schemeId: number | string): void {
    this.router.navigate(['/scheme-details', schemeId]);
  }

  navigateToAllSchemes(): void {
    this.router.navigate(['/schemes']);
  }
  
}
