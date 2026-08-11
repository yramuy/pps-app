import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
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
    scheme_title: '',
    scheme_description: '',
    master_id: '10',
    mode: 'web',
  };

  isEdit: boolean = false;

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: string[] = [];
  scheme_images: string[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const state: any = history.state;

    if (state.scheme) {
      this.scheme = state.scheme;
      this.isEdit = true;

      if (this.scheme.scheme_pic) {
        if (Array.isArray(this.scheme.scheme_pic)) {
          this.existingImages = this.scheme.scheme_pic;
        } else if (typeof this.scheme.scheme_pic === 'string') {
          this.existingImages = [this.scheme.scheme_pic];
        }
      }

      this.loadViewSchemeDeta(this.scheme.id);
    }

    this.authService.user$.subscribe((user: any) => {
      this.loginUser = user;
    });
  }

  loadViewSchemeDeta(schemeID: any) {
    this.apiService.request('GET', `/schemeDataById/${schemeID}`).subscribe({
      next: (res: any) => {
        this.scheme_images = res.scheme_images || [];

        this.existingImages = (res.scheme_images || []).map(
          (img: any) => img.img_url,
        );
      },
    });
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        alert('Only image files allowed');
        continue;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removeSelectedImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

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

  saveScheme(form: NgForm) {
    if (form.invalid) return;

    if (this.selectedFiles.length === 0 && this.existingImages.length === 0) {
      this.showMessage('At least one scheme picture is required');
      return;
    }

    const formData = new FormData();

    Object.keys(this.scheme).forEach((key) => {
      if (key !== 'scheme_pic') {
        formData.append(key, this.scheme[key] ?? '');
      }
    });

    formData.append('id', this.scheme.id ?? '');
    formData.append('master_id', '10');
    formData.append('created_by', this.loginUser?.userId);

    // Existing images in edit mode
    this.existingImages.forEach((img) => {
      formData.append('existing_images[]', img);
    });

    // New uploaded images
    this.selectedFiles.forEach((file) => {
      formData.append('images[]', file);
    });

    console.log('FormData values:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.apiService
      .request('POST', '/saveAndUpdateAboutUs', formData)
      .subscribe({
        next: (res: any) => {
          if (res.status) {
            this.router.navigate(['/admin/aboutUs/add'], {
              state: { message: res.message || 'Success' },
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

  handleBackBtn() {
    this.router.navigate(['/admin/schemes/list']);
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
