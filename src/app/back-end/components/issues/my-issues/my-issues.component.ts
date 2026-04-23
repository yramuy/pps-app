import { Component, signal } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-my-issues',
  templateUrl: './my-issues.component.html',
  styleUrls: ['./my-issues.component.scss'],
})
export class MyIssuesComponent {
  // 🔹 Signals (state)
  myIssues = signal<any[]>([]);
  loginUser = signal<any>(null);
  loading = signal(false);
  message = signal('');

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public loader: LoaderService,
  ) {
    // ✅ Subscribe once → trigger API
    this.authService.user$.subscribe((user) => {
      this.loginUser.set(user);

      if (user) {
        this.loadMyIssues(user); // ✅ only once per user
      }
    });
  }

  // 🔥 API call
  loadMyIssues(user: any) {
    this.loading.set(true);
    this.loader.show();

    const payloadObj: any = {};

    if (user?.userId) payloadObj.created_by = user.userId;

    payloadObj.category_id = '';

    const payload = JSON.stringify(payloadObj);

    this.apiService.request('POST', '/myIssues', payload).subscribe({
      next: (res: any) => {
        this.myIssues.set(res.my_issues || []);
        console.log('myIssues : ', this.myIssues()); // ✅ correct place
        this.loading.set(false);
        this.loader.hide();

        setTimeout(() => {
          if (this.myIssues().length > 0) {
            if ($.fn.DataTable.isDataTable('#myIssuesTable')) {
              ($('#myIssuesTable') as any).DataTable().destroy();
            }

            ($('#myIssuesTable') as any).DataTable({
              dom: 'Bfrtip',
              buttons: ['excel', 'pdf'],
              responsive: true,
            });
          }
        }, 0);
      },

      error: (err: any) => {
        if (err.status === 401) {
          this.message.set('Token expired');
          this.authService.setLoginStatus(false);
        } else if (err.status === 400) {
          this.message.set('Invalid request data');
        } else if (err.status === 500) {
          this.message.set('Server error. Please try again later');
        } else {
          this.message.set('Something went wrong. Please try again later');
        }

        this.loading.set(false);
        this.loader.hide();
      },
    });
  }
}
