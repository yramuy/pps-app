import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-issues-list',
  templateUrl: './issues-list.component.html',
  styleUrls: ['./issues-list.component.scss'],
})
export class IssuesListComponent {
  // 🔹 Signals (state)
  issuesList = signal<any[]>([]);
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
        this.loadAllIssues(user); // ✅ only once per user
      }
    });
  }

  // 🔥 API call
  loadAllIssues(user: any) {
    this.loading.set(true);
    this.loader.show();

    const payloadObj: any = {};

    if (user?.stateID) payloadObj.state_id = user.stateID;
    if (user?.districtID) payloadObj.district_id = user.districtID;
    if (user?.assemblyID) payloadObj.assembly_id = user.assemblyID;
    if (user?.mandalID) payloadObj.mandal_id = user.mandalID;
    if (user?.villageID) payloadObj.village_id = user.villageID;

    payloadObj.category_id = '';

    const payload = JSON.stringify(payloadObj);

    console.log('All Issues Payload:', payload);

    this.apiService.request('POST', '/allIssues', payload).subscribe({
      next: (res: any) => {
        this.issuesList.set(res.all_issues || []);
        console.log('issuesList : ', this.issuesList()); // ✅ correct place
        this.loading.set(false);
        this.loader.hide();

        setTimeout(() => {
          if (this.issuesList().length > 0) {
            // ✅ Destroy if already exists
            if ($.fn.DataTable.isDataTable('#issuesTable')) {
              ($('#issuesTable') as any).DataTable().destroy();
            }

            // ✅ Reinitialize
            ($('#issuesTable') as any).DataTable({
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
