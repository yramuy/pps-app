import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.scss'],
})
export class ViewIssueComponent {
  issueID: any = '';
  issueData: any = {};

  selectedStatusId: any = ''; // ✅ separate variable
  issueWorkflowList: any = []; // ✅ workflow history

  message: any = '';
  isMessage: boolean = false;
  isLoading: boolean = false;

  issue_comment = '';
  wf_comment = '';

  loginUser: any;
  issueComments: any = [];
  issueStatuses: any = [];

  views: any = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public loader: LoaderService,
  ) {}

  ngOnInit() {
    const state = history.state;
    this.issueID = state.issueID;

    this.authService.user$.subscribe((user) => {
      this.loginUser = user;
    });

    if (this.issueID) {
      this.loadViewIssueDeta(this.issueID);
      this.saveIssueView();
      this.loadStatuses();
    }
  }

  loadStatuses() {
    const payload = {
      master_id: '11',
      mode: 'web',
    };

    this.apiService.request('POST', '/masterData', payload).subscribe({
      next: (res: any) => {
        this.issueStatuses = res?.master_data || [];
      },
    });
  }

  getLocation(): string {
    const parts = [
      this.issueData.assembly,
      this.issueData.mandal,
      this.issueData.village,
    ];
    return parts.filter((p) => p && p.trim() !== '').join(', ');
  }

  saveIssueView() {
    const payload = {
      issue_id: this.issueID,
      viewed_by: this.loginUser?.userId,
    };

    this.apiService.request('POST', '/saveIssueViews', payload).subscribe();
  }

  loadViewIssueDeta(issueID: any) {
    this.loader.show();

    this.apiService.request('GET', `/issueDataById/${issueID}`).subscribe({
      next: (res: any) => {
        this.issueData = res.issueData?.[0] || {};
        this.issueComments = res.comments || [];
        this.issueWorkflowList = res.workflow || [];
        this.views = res.views || 0;

        // ✅ set dropdown value separately
        this.selectedStatusId = this.issueData.status_id;

        this.loader.hide();
      },
      error: () => this.loader.hide(),
    });
  }

  submitWorkFlow(form: any) {
    if (form.invalid) return;

    const payload = {
      issue_id: this.issueID,
      created_by: this.loginUser?.userId,
      comment: this.wf_comment,
      status_id: this.selectedStatusId, // ✅ FIX
    };

    this.loader.show();

    this.apiService.request('POST', '/saveIssueWorkflow', payload).subscribe({
      next: (res: any) => {
        this.showMessage(res.message);

        form.resetForm();
        this.wf_comment = '';

        // reload data
        this.loadViewIssueDeta(this.issueID);

        this.loader.hide();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => this.loader.hide(),
    });
  }

  submitComment(form: any) {
    if (form.invalid) return;

    const payload = {
      id: '0',
      issue_id: this.issueID,
      comment: this.issue_comment,
      submitted_by: this.loginUser?.userId,
      submitted_by_name: this.loginUser?.fullName,
      master_id: '12',
    };

    this.loader.show();

    this.apiService.request('POST', '/saveIssueComment', payload).subscribe({
      next: () => {
        this.issue_comment = '';
        form.resetForm();

        this.loadViewIssueDeta(this.issueID);
        this.loader.hide();
      },
      error: () => this.loader.hide(),
    });
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
