import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-assigned-to-me-issues',
  templateUrl: './assigned-to-me-issues.component.html',
  styleUrls: ['./assigned-to-me-issues.component.scss'],
})
export class AssignedToMeIssuesComponent {
  // 🔹 Signals (state)
  assignedToMeIssues = signal<any[]>([]);
  loginUser = signal<any>(null);
  loading = signal(false);
  message = signal('');

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public loader: LoaderService,
    private router: Router
  ) {
    // ✅ Subscribe once → trigger API
    this.authService.user$.subscribe((user) => {
      this.loginUser.set(user);

      if (user) {
        this.loadAssignedToMeIssues(user); // ✅ only once per user
      }
    });
  }

  // 🔥 API call
  loadAssignedToMeIssues(user: any) {
    this.loading.set(true);
    this.loader.show();

    const payloadObj: any = {};

    if (user?.userId) payloadObj.assigned_to = user.userId;

    payloadObj.category_id = '';

    const payload = JSON.stringify(payloadObj);

    this.apiService.request('POST', '/assignedToMeIssues', payload).subscribe({
      next: (res: any) => {
        this.assignedToMeIssues.set(res.assignedToMe_issues || []);
        console.log('assignedToMeIssues : ', this.assignedToMeIssues()); // ✅ correct place
        this.loading.set(false);
        this.loader.hide();

        setTimeout(() => {
          if (this.assignedToMeIssues().length > 0) {
            // ✅ Destroy if already exists
            if ($.fn.DataTable.isDataTable('#assignedToMeIssuesTable')) {
              ($('#assignedToMeIssuesTable') as any).DataTable().destroy();
            }

            // ✅ Reinitialize
            ($('#assignedToMeIssuesTable') as any).DataTable({
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
          this.authService.logout();
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

    handleView(id: any) {
    this.router.navigate(['/admin/issues/view-issue'], {
      state: {
        issueID: id
      },
    });
  }
}
