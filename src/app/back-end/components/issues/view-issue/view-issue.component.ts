import { Component } from '@angular/core';
import { single } from 'rxjs';
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
  message: any = '';
  isLoading: boolean = false;
  issue_comment = '';
  loginUser: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public loader: LoaderService,
  ) {}

  ngOnInit() {
    const state = history.state;
    this.issueID = state.issueID;

    if (state.issueID) {
      this.loadViewIssueDeta(this.issueID);
    }

    this.authService.user$.subscribe((user) => {
      this.loginUser = user;
    });
  }

  loadViewIssueDeta(issueID: any) {
    this.isLoading = true;
    this.loader.show();
    this.apiService.request('GET', `/issueDataById/${issueID}`).subscribe({
      next: (res: any) => {
        this.issueData = res.issueData?.[0] || {};
        console.log('Single Issue:', this.issueData);
        this.isLoading = false;
        this.loader.hide();
      },
      error: (err: any) => {
        if (err.status === 401) {
          this.message = 'Token expired';
          this.authService.logout();
        } else if (err.status === 400) {
          this.message = 'Invalid request data';
        } else if (err.status === 500) {
          this.message = 'Server error. Please try again later';
        } else {
          this.message = 'Something went wrong. Please try again later';
        }
        this.isLoading = false;
        this.loader.hide();
      },
    });
  }

  submitComment(form: any) {
    if (form.invalid) {
      return;
    }

    const payload = {
      id: '0',
      issue_id: this.issueID,
      comment: this.issue_comment,
      submitted_by: this.loginUser?.userId,
      submitted_by_name: this.loginUser?.fullName,
      master_id: '12'
    };

    console.log('Payload:', payload);

    this.loader.show();

    this.apiService.request('POST', '/saveIssueComment', payload).subscribe({
      next: (res: any) => {
        this.loader.hide();

        this.message = 'Comment added successfully';

        // ✅ Clear form
        this.issue_comment = '';
        form.resetForm();

        // 🔄 Optional: reload issue data/comments
        this.loadViewIssueDeta(this.issueID);
      },
      error: (err: any) => {
        this.loader.hide();

        if (err.status === 401) {
          this.message = 'Token expired';
          this.authService.logout();
        } else if (err.status === 400) {
          this.message = 'Invalid request';
        } else {
          this.message = 'Something went wrong';
        }
      },
    });
  }
}
