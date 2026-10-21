import { Component, ElementRef, ViewChild } from '@angular/core';

import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-add-scheme',
  templateUrl: './add-scheme.component.html',
  styleUrls: ['./add-scheme.component.scss'],
})
export class AddSchemeComponent {
  message: string = '';
  isMessage: boolean = false;

  loginUser: any;

  scheme: any = {
    id: '0',

    post_date: '',

    scheme_type: '',

    scheme_title: '',

    scheme_description: '',

    master_id: '10',

    mode: 'web',
  };

  isEdit: boolean = false;

  selectedFiles: File[] = [];

  imagePreviews: string[] = [];

  existingImages: string[] = [];

  scheme_images: any[] = [];

  private pendingApiCalls = 0;
  isLoading = false;

  @ViewChild('fileInput')
  fileInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const state: any = history.state;

    /*
     * Edit Scheme
     */
    if (state.scheme) {
      this.scheme = {
        ...this.scheme,
        ...state.scheme,
      };

      this.isEdit = true;

      /*
       * Existing scheme images
       */
      if (this.scheme.scheme_pic) {
        if (Array.isArray(this.scheme.scheme_pic)) {
          this.existingImages = this.scheme.scheme_pic;
        } else if (typeof this.scheme.scheme_pic === 'string') {
          this.existingImages = [this.scheme.scheme_pic];
        }
      }

      /*
       * Load complete scheme details
       */
      this.loadViewSchemeDeta(this.scheme.id);
    }

    /*
     * Logged-in User
     */
    this.authService.user$.subscribe((user: any) => {
      this.loginUser = user;
    });
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

  /*
   * Load Scheme Details
   */
  loadViewSchemeDeta(schemeID: any) {
    const payload = JSON.stringify({
      is_token: '1',
      scheme_id: schemeID,
    });

    console.log('schemeDataById payload:', payload);

    // ------------------------------------------------------------
    // API CALL
    // ------------------------------------------------------------

    this.requestWithLoader('/schemeDataById', payload).subscribe({
      next: (res: any) => {
        /*
         * If API returns scheme details
         */
        if (res.scheme) {
          this.scheme = {
            ...this.scheme,
            ...res.scheme,
          };
        }

        /*
         * Scheme Images
         */
        this.scheme_images = res.scheme_images || [];

        this.existingImages = (res.scheme_images || []).map(
          (img: any) => img.img_url,
        );
      },

      error: () => {
        this.showMessage('Unable to load scheme details');
      },
    });
  }

  /*
   * File Change
   */
  onFileChange(event: any) {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      /*
       * Validate Image
       */
      if (!file.type.startsWith('image/')) {
        alert('Only image files allowed');

        continue;
      }

      /*
       * Add File
       */
      this.selectedFiles.push(file);

      /*
       * Preview
       */
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };

      reader.readAsDataURL(file);
    }

    /*
     * Reset file input
     */
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /*
   * Remove New Image
   */
  removeSelectedImage(index: number) {
    this.selectedFiles.splice(index, 1);

    this.imagePreviews.splice(index, 1);
  }

  /*
   * Remove Existing Image
   */
  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  /*
   * Reset Images
   */
  resetImages(removeExisting: boolean = false) {
    this.selectedFiles = [];

    this.imagePreviews = [];

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    if (removeExisting) {
      this.existingImages = [];

      this.scheme.scheme_pic = '';
    }
  }

  /*
   * Save / Update Scheme
   */
  saveScheme(form: NgForm) {
    /*
     * Validate Form
     */
    if (form.invalid) {
      return;
    }

    /*
     * Validate Images
     */
    if (this.selectedFiles.length === 0 && this.existingImages.length === 0) {
      this.showMessage('At least one scheme picture is required');

      return;
    }

    /*
     * FormData
     */
    const formData = new FormData();

    /*
     * Append Scheme Fields
     */
    Object.keys(this.scheme).forEach((key) => {
      if (key !== 'scheme_pic') {
        formData.append(key, this.scheme[key] ?? '');
      }
    });

    /*
     * Required Fields
     */
    formData.append('id', this.scheme.id ?? '');

    formData.append('master_id', '10');

    formData.append('created_by', this.loginUser?.userId ?? '');

    /*
     * Existing Images
     */
    this.existingImages.forEach((img) => {
      formData.append('existing_images[]', img);
    });

    /*
     * New Images
     */
    this.selectedFiles.forEach((file) => {
      formData.append('images[]', file);
    });

    /*
     * Debug FormData
     */
    console.log('FormData values:');

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    /*
     * Save API
     */
    this.requestWithLoader('/saveAndUpdateScheme', formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.router.navigate(['/admin/schemes/list'], {
            state: {
              message: res.message || 'Scheme saved successfully',
            },
          });
        } else {
          this.showMessage(res.message);
        }
      },

      error: () => {
        this.showMessage('Something went wrong');
      },
    });
  }

  /*
   * Back
   */
  handleBackBtn() {
    this.router.navigate(['/admin/schemes/list']);
  }

  /*
   * Message
   */
  showMessage(msg: string) {
    this.message = msg;

    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
