import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  isMessage: boolean = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public loader: LoaderService,
    private router: Router,
  ) {
    // ✅ Subscribe once → trigger API
    this.authService.user$.subscribe((user) => {
      this.loginUser.set(user);

      if (user) {
        this.loadMyIssues(user); // ✅ only once per user
      }
    });
  }

  ngOnInit() {
    const state = history.state;

    if (state.message) {
      this.message.set(state.message);
      this.isMessage = true;

      // Clear History
      history.replaceState({}, '');

      setTimeout(() => {
        this.isMessage = false;
      }, 3000);
    }
  }

  // 🔥 API call
  loadMyIssues(user: any) {
    // this.loading.set(true);
    this.loader.show();

    const payloadObj: any = {};

    if (user?.userId) payloadObj.created_by = user.userId;

    payloadObj.category_id = '';

    const payload = JSON.stringify(payloadObj);

    this.apiService.request('POST', '/myIssues', payload).subscribe({
      next: (res: any) => {
        this.myIssues.set(res.my_issues || []);
        console.log('myIssues : ', this.myIssues()); // ✅ correct place
        // this.loading.set(false);
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
          this.authService.logout();
        } else if (err.status === 400) {
          this.message.set('Invalid request data');
        } else if (err.status === 500) {
          this.message.set('Server error. Please try again later');
        } else {
          this.message.set('Something went wrong. Please try again later');
        }

        // this.loading.set(false);
        this.loader.hide();
      },
    });
  }

  handleEdit(issueObj: any) {
    this.router.navigate(['/admin/issues/create'], {
      state: {
        issue: issueObj,
        isEdit: true,
      },
    });
  }

  confirmDelete(id: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.deleteIssue(id);
    }
  }

  handleView(id: any) {
    this.router.navigate(['/admin/issues/view-issue'], {
      state: {
        issueID: id
      },
    });
  }

  deleteIssue(id: string) {
    const payload = JSON.stringify({
      id: id,
      master_id: '9',
    });

    this.apiService.request('POST', '/deleteRecord', payload).subscribe({
      next: (res: any) => {
        this.showMessage(res.message);

        // ✅ Update signal correctly
        this.myIssues.update((issues) =>
          issues.filter((c: any) => c.id !== id),
        );

        // ✅ Reload DataTable
        this.reloadDataTable();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  reloadDataTable() {
    // ✅ Destroy first
    if ($.fn.DataTable.isDataTable('#myIssuesTable')) {
      ($('#myIssuesTable') as any).DataTable().destroy();
    }

    // ✅ Wait for Angular DOM update
    setTimeout(() => {
      ($('#myIssuesTable') as any).DataTable({
        dom: 'Bfrtip',
        buttons: ['excel', 'pdf'],
        responsive: true,
      });
    }, 100);
  }

  showMessage(msg: string) {
    this.message.set(msg);
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
