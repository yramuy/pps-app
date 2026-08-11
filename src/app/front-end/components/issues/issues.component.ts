import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss'],
})
export class IssuesComponent {
  issues = signal<any[]>([]);
  message = signal('');
  selectedIssue: any = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    // ✅ Subscribe once → trigger API
    // this.authService.user$.subscribe((user) => {
    //   this.loginUser.set(user);

    //   if (user) {
    //     this.loadSchemes(user); // ✅ only once per user
    //   }
    // });

    this.loadTopFiveIssues();
  }

  loadTopFiveIssues() {
    const payload = {
      state_id: '',
      district_id: '',
      assembly_id: '',
      mandal_id: '',
      village_id: '',
      mode: '0'
    };

    this.apiService.request('POST', '/topFiveIssues', payload).subscribe({
      next: (res: any) => {
        this.issues.set(res.top_five_issues || []);
        console.log('Issues:', this.issues());
      },

      error: (err: any) => {
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
      },
    });
  }
}
