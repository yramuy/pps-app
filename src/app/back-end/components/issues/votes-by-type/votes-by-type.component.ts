
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-diamond',
  templateUrl: './votes-by-type.component.html',
  styleUrls: ['./votes-by-type.component.scss'],
})
export class VotesByTypeComponent implements OnInit {
  diamondIssues: any[] = [];

  selectedVoteType: 'diamond' | 'bronze' = 'diamond';

  message = '';
  isMessage = false;
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    public loader: LoaderService,
  ) {}

  ngOnInit(): void {
    this.loadIssuesByVoteType();
  }

  /**
   * Load issues whenever the selected vote type changes.
   */
  onVoteTypeChange(type: 'diamond' | 'bronze'): void {
    this.selectedVoteType = type;
    this.loadIssuesByVoteType();
  }

  /**
   * Fetch diamond or bronze issues from the API.
   */
  loadIssuesByVoteType(): void {
    this.isLoading = true;
    this.message = '';
    this.isMessage = false;
    this.diamondIssues = [];

    const payload = {
      is_token: '1',
      vote_type: this.selectedVoteType,
    };

    this.apiService
      .request('POST', '/diamondAndBronzeIssues', payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.diamondIssues = Array.isArray(res?.voting)
            ? res.voting
            : [];
        },
        error: (err: any) => {
          console.error('Voting API error:', err);

          this.diamondIssues = [];

          this.showMessage(
            `Unable to load ${
              this.selectedVoteType === 'diamond' ? 'Diamond' : 'Bronze'
            } issues. Please try again.`,
          );
        },
      });
  }

  /**
   * Navigate to issue details.
   */
  readMore(id: any): void {
    this.router.navigate(['/admin/issues/view-issue'], {
      state: {
        issueID: id,
      },
    });
  }

  /**
   * Existing gift workflow placeholder.
   */
  sendGift(issue: any): void {
    console.log('Send gift:', issue);
  }

  /**
   * Display an error message.
   */
  showMessage(msg: string): void {
    this.message = msg;
    this.isMessage = true;
  }
}
