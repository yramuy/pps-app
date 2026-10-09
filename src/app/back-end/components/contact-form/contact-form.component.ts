import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent implements OnInit, OnDestroy {
  // =========================================
  // Image Input Reference
  // =========================================
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // =========================================
  // Contact Us Form Data
  // =========================================
  contact: any = {
    id: '',
    name: '',
    email: '',
    contact_number: '',
    address: '',
    image: '',
  };

  // =========================================
  // Image Variables
  // =========================================
  selectedImage: File | null = null;
  imagePreview: string = '';

  private readonly maxImageSize = 2 * 1024 * 1024;

  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  // =========================================
  // Loading and Message Variables
  // =========================================
  loading: boolean = false;
  isMessage: boolean = false;
  message: string = '';

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

  // =========================================
  // Load Contact Us Details
  // =========================================
  loadContactUs(): void {
    this.loading = true;

    this.apiService
      .request('POST', '/contactUs', {
        mode: '1',
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          console.log('Contact Us Response:', res);

          // Handle API response containing a single record or array
          let contactData: any = null;

          if (res.status && res.data) {
            contactData = Array.isArray(res.data) ? res.data[0] : res.data;
          }

          if (contactData) {
            this.contact = {
              id: contactData.id ?? '',
              name: contactData.name ?? '',
              email: contactData.email ?? '',
              contact_number: contactData.contact_number ?? '',
              address: contactData.address ?? '',
              image: contactData.image ?? '',
            };

            // Load saved image
            this.imagePreview = this.contact.image;

            this.selectedImage = null;

            console.log('Bound Contact Data:', this.contact);
          } else {
            console.warn('No Contact Us record found in API response.');
          }
        },
        error: (error: any) => {
          this.loading = false;

          console.error('Contact Us Error:', error);
          this.showMessage('Unable to load contact details.');
        },
      });
  }

  // =========================================
  // Image Selection and Validation
  // =========================================
  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Validate image type
    if (!this.allowedImageTypes.includes(file.type)) {
      this.showMessage('Please upload a JPG, PNG, or WEBP image.');
      input.value = '';
      return;
    }

    // Validate image size
    if (file.size > this.maxImageSize) {
      this.showMessage('Image size must not exceed 2 MB.');
      input.value = '';
      return;
    }

    // Clear previous selected image preview
    this.clearImage();

    // Store selected image
    this.selectedImage = file;
    this.imagePreview = URL.createObjectURL(file);

    this.isMessage = false;
    this.message = '';
  }

  // =========================================
  // Remove Selected Image
  // =========================================
  removeImage(): void {
    this.clearImage();

    // Clear file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // Clear saved image reference for the next save
    this.contact.image = '';

    this.isMessage = false;
    this.message = '';
  }

  // =========================================
  // Save / Update Contact Us Details
  // =========================================
  saveContact(form: NgForm): void {
    this.isMessage = false;
    this.message = '';

    // Validate form
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    // Prepare FormData
    const formData = new FormData();

    formData.append('id', this.contact.id ? String(this.contact.id) : '');
    formData.append('master_id', '16');

    formData.append('name', (this.contact.name || '').trim());
    formData.append('email', (this.contact.email || '').trim());
    formData.append(
      'contact_number',
      (this.contact.contact_number || '').trim(),
    );
    formData.append('address', (this.contact.address || '').trim());

    // Attach image only when a new image is selected
    if (this.selectedImage) {
      formData.append('image', this.selectedImage, this.selectedImage.name);
    }

    // Debug FormData
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    // Save Contact Us
    this.apiService
      .request('POST', '/saveAndUpdateContactUs', formData)
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          console.log('Save Contact Response:', res);

          if (res.status) {
            this.showMessage(
              res.message || 'Contact details saved successfully.',
            );

            // Clear selected upload
            this.selectedImage = null;

            // Release temporary preview URL if present
            if (this.imagePreview.startsWith('blob:')) {
              URL.revokeObjectURL(this.imagePreview);
            }

            // Clear file input
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }

            // Reload latest saved details from API
            this.loadContactUs();
          } else {
            this.showMessage(res.message || 'Unable to save contact details.');
          }
        },
        error: (error: any) => {
          this.loading = false;

          console.error('Save Contact Error:', error);

          this.showMessage(
            error.error?.message ||
              'Something went wrong while saving contact details.',
          );
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

  // =========================================
  // Clear Selected Image and Preview
  // =========================================
  private clearImage(): void {
    if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreview);
    }

    this.imagePreview = '';
    this.selectedImage = null;
  }

  // =========================================
  // Back Button
  // =========================================
  handleBackBtn(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  // =========================================
  // Component Destroy
  // =========================================
  ngOnDestroy(): void {
    this.clearImage();
  }
}
