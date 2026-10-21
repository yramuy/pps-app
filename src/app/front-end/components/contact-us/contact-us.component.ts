import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
})
export class ContactUsComponent {
  isMessage: any = false;
  message: any = false;
  contactData: any = {};
  private pendingApiCalls = 0;
  isLoading = false;

  // =========================================
  // Constructor
  // =========================================
  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {}

  // =========================================
  // Component Initialization
  // =========================================
  ngOnInit(): void {
    this.loadContactUs();
  }

  private requestWithLoader(endpoint: string, payload: any): any {
    this.pendingApiCalls++;
    this.isLoading = true;

    return this.apiService.request('POST', endpoint, payload).pipe(
      finalize(() => {
        this.pendingApiCalls = Math.max(0, this.pendingApiCalls - 1);
        this.isLoading = this.pendingApiCalls > 0;
      }),
    );
  }

  // =========================================
  // Load Contact Us Details
  // =========================================
  loadContactUs(): void {
    // this.loading = true;

    this.requestWithLoader('/contactUs', {
      mode: '0',
    }).subscribe({
      next: (res: any) => {
        // this.loading = false;

        console.log('Contact Us Response:', res);

        if (res.status && res.data) {
          this.contactData = Array.isArray(res.data) ? res.data[0] : res.data;
        }

        // if (contactData) {
        //   this.contact = {
        //     id: contactData.id ?? '',
        //     name: contactData.name ?? '',
        //     email: contactData.email ?? '',
        //     contact_number: contactData.contact_number ?? '',
        //     address: contactData.address ?? '',
        //     image: contactData.image ?? '',
        //   };

        //   // Load saved image
        //   this.imagePreview = this.contact.image;

        //   this.selectedImage = null;

        //   console.log('Bound Contact Data:', this.contact);
        // } else {
        //   console.warn('No Contact Us record found in API response.');
        // }
      },
      error: (error: any) => {
        // this.loading = false;

        console.error('Contact Us Error:', error);
        this.showMessage('Unable to load contact details.');
      },
    });
  }

  // =========================================
  // Display Message
  // =========================================
  showMessage(msg: string): void {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
