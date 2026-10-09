import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-scheme-details',
  templateUrl: './scheme-details.component.html',
  styleUrls: ['./scheme-details.component.scss']
})
export class SchemeDetailsComponent implements OnInit {

  schemeData: any = {};
  message: string = '';
  loading: boolean = false;
  schemeId: any;
  scheme_images: any = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {

    // Move page to top
    window.scrollTo(0, 0);

    // Get scheme ID from URL
    this.schemeId = this.route.snapshot.paramMap.get('id');

    console.log('Scheme ID:', this.schemeId);

    // Check ID before API call
    if (this.schemeId) {
      this.loadSchemeData();
    } else {
      this.message = 'Scheme ID not found';
    }
  }

  loadSchemeData(): void {

    this.loading = true;
    this.message = '';

    const payload = {
      is_token: '0',
      scheme_id: this.schemeId
    };

    console.log('Scheme API Payload:', payload);

    this.apiService.request(
      'POST',
      '/schemeDataById',
      payload
    ).subscribe({

      next: (res: any) => {

        console.log('Scheme Details Response:', res);

        this.schemeData = res?.schemeData || {};

        // Get all scheme images
        this.scheme_images = res?.scheme_images[0] || [];

        console.log('Scheme Data:', this.schemeData);
        console.log('Scheme Images:', this.scheme_images);

        this.loading = false;
      },

      error: (err: any) => {

        console.error('Scheme Details Error:', err);

        if (err.status === 400) {
          this.message = 'Invalid request data';
        } else if (err.status === 500) {
          this.message = 'Server error. Please try again later';
        } else {
          this.message = 'Something went wrong. Please try again later';
        }

        this.loading = false;
      }

    });
  }
}