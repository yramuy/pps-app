import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-add-advertisement',
  templateUrl: './add-advertisement.component.html',
  styleUrls: ['./add-advertisement.component.scss'],
})
export class AddAdvertisementComponent {
  message: string = '';
  isMessage: boolean = false;

  loginUser: any;

  advertisement: any = {
    id: '0',
    advertisement_title: '',
    advertisement_description: '',
    master_id: '10',
    mode: 'web',
  };

  isEdit: boolean = false;

  selectedFile: File | null = null;
  imagePreview: string = '';
  existingImage: string = '';

  advertisement_images: any[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const state: any = history.state;

    if (state.advertisement) {
      this.advertisement = state.advertisement;
      this.isEdit = true;

      if (this.advertisement.imageUrl) {
        if (Array.isArray(this.advertisement.imageUrl)) {
          this.existingImage =
            this.advertisement.imageUrl || '';
        } else if (
          typeof this.advertisement.imageUrl === 'string'
        ) {
          this.existingImage = this.advertisement.imageUrl;
        }
      }

      // this.loadViewAdvertisementData(this.advertisement.id);
    }

    this.authService.user$.subscribe((user: any) => {
      this.loginUser = user;
    });
  }

  // loadViewAdvertisementData(advertisementId: any): void {
  //   this.apiService
  //     .request('GET', `/advertisementDataById/${advertisementId}`)
  //     .subscribe({
  //       next: (res: any) => {
  //         this.advertisement_images = res.advertisement_images || [];

  //         const firstImage = this.advertisement_images[0];

  //         this.existingImage = firstImage?.img_url || '';
  //       },
  //       error: () => {
  //         this.showMessage('Unable to load advertisement image');
  //       },
  //     });
  // }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.showMessage('Only image files are allowed');
      this.clearFileInput();
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;

      // A newly selected image replaces the existing image visually.
      this.existingImage = '';
    };

    reader.readAsDataURL(file);

    // Allows selecting the same file again after removing it.
    this.clearFileInput(false);
  }

  removeSelectedImage(): void {
    this.selectedFile = null;
    this.imagePreview = '';

    this.clearFileInput();
  }

  removeExistingImage(): void {
    this.existingImage = '';
    this.advertisement.advertisement_image = '';
  }

  resetImages(removeExisting: boolean = false): void {
    this.selectedFile = null;
    this.imagePreview = '';

    if (removeExisting) {
      this.existingImage = '';
      this.advertisement.advertisement_image = '';
    }

    this.clearFileInput();
  }

  saveAdvertisement(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    if (!this.selectedFile && !this.existingImage) {
      this.showMessage('At least one advertisement picture is required');
      return;
    }

    const formData = new FormData();

    Object.keys(this.advertisement).forEach((key: string) => {
      if (key !== 'advertisement_image') {
        formData.append(
          key,
          this.advertisement[key] !== null &&
            this.advertisement[key] !== undefined
            ? this.advertisement[key]
            : '',
        );
      }
    });

    formData.append('id', this.advertisement.id ?? '');
    formData.append('master_id', '15');
    formData.append('created_by', this.loginUser?.userId ?? '');

    // Existing image is sent only when the user has not selected a new image.
    if (!this.selectedFile && this.existingImage) {
      formData.append('existing_image', this.existingImage);
    }

    // Send only one new image.
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    console.log('FormData values:');

    formData.forEach((value: FormDataEntryValue, key: string) => {
      console.log(key, value);
    });

    this.apiService
      .request('POST', '/saveAndUpdateAdvertisement', formData)
      .subscribe({
        next: (res: any) => {
          if (res.status) {
            this.router.navigate(['/admin/advertisement/list'], {
              state: {
                message: res.message || 'Advertisement saved successfully',
              },
            });
          } else {
            this.showMessage(res.message || 'Unable to save advertisement');
          }
        },
        error: () => {
          this.showMessage('Something went wrong');
        },
      });
  }

  handleBackBtn(): void {
    this.router.navigate(['/admin/advertisement/list']);
  }

  showMessage(msg: string): void {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }

  private clearFileInput(clearPreview: boolean = true): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    if (clearPreview) {
      this.selectedFile = null;
      this.imagePreview = '';
    }
  }
}