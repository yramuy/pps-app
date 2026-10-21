import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-bronze',
  templateUrl: './bronze.component.html',
  styleUrls: ['./bronze.component.scss'],
})
export class BronzeComponent {
  bronzeIssues: any = [];
  message = '';
  isMessage = false;
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    public loader: LoaderService,
  ) {}

  ngOnInit(): void {
    this.loadBronzeIssues();
  }

  readMore(id: any): void {
    // Replace with your existing issue details navigation.
    console.log('Read more:', id);
    this.router.navigate(['/admin/issues/view-issue'], {
      state: {
        issueID: id,
      },
    });
    // Replace with your existing issue details navigation.
    console.log('Read more:', id);
  }

  sendGift(issue: any): void {
    // Replace with your existing gift/voting workflow.
    console.log('Send gift:', issue);
  }

  loadBronzeIssues() {
    this.isLoading = true;
    const payload = {
      is_token: '1',
      vote_type: 'bronze',
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
          this.bronzeIssues = res?.voting || [];
        },
        error: (err: any) => {
          console.error('Voting API error:', err);
          this.showMessage('Unable to update vote. Please try again.');
        },
      });
  }

  // =====================================================
  // Message
  // =====================================================

  showMessage(msg: string): void {
    this.message = msg;

    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
