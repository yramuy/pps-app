import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-issue-details',
  templateUrl: './issue-details.component.html',
  styleUrls: ['./issue-details.component.scss'],
})
export class IssueDetailsComponent implements OnInit {

  issueData: any = {};
  message: string = '';
  loading: boolean = false;
  issueId: any;
  issue_images: any = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    // Move page to top
    window.scrollTo(0, 0);

    // Get issue ID from URL
    this.issueId = this.route.snapshot.paramMap.get('id');

    console.log('Issue ID:', this.issueId);

    // Check ID before API call
    if (this.issueId) {
      this.loadIssueData();
    } else {
      this.message = 'Issue ID not found';
    }
  }

  loadIssueData(): void {

    this.loading = true;
    this.message = '';

    const payload = {
      is_token: '0',
      issue_id: this.issueId,
    };

    console.log('Issue API Payload:', payload);

    this.apiService.request('POST', '/issueDataById', payload).subscribe({

      next: (res: any) => {

        console.log('Issue Details Response:', res);

        this.issueData = res?.issueData || {};

        this.issue_images = res.issue_images[0] || [];

        this.loading = false;
      },

      error: (err: any) => {

        console.error('Issue Details Error:', err);

        if (err.status === 400) {
          this.message = 'Invalid request data';
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