import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  public Editor: any = ClassicEditor;

  public editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'blockQuote',
      'insertTable',
      '|',
      'undo',
      'redo',
    ],
    placeholder: 'Enter description here...',
  };

  about: any = {
    id: '',
    title: '',
    sub_title: '',
    description: '',
    vision: '',
    mission: '',
    chairman_message: '',
    image: '',
  };

  selectedFile: File | null = null;
  imagePreview = '';

  loading = false;
  isMessage = false;
  message = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAboutUs();
  }

  // ======================
  // Get About Us
  // ======================
  getAboutUs(): void {

  this.loading = true;

  let payload = {
    'mode': '1'
  };

  this.apiService
    .request('POST', '/aboutUs', payload)
    .subscribe({
      next: (res: any) => {

        this.loading = false;

        if (res.status && res.data && res.data.length > 0) {

          const data = res.data[0];

          this.about = {
            id: data.id || '',
            title: data.title || '',
            sub_title: data.sub_title || '',
            description: data.description || '',
            vision: data.vision || '',
            mission: data.mission || '',
            chairman_message: data.chairman_message || '',
            image: data.image || ''
          };

          // Existing image
          this.imagePreview = data.image || '';

        } else {

          this.about = {
            id: '',
            title: '',
            sub_title: '',
            description: '',
            vision: '',
            mission: '',
            chairman_message: '',
            image: ''
          };

          this.imagePreview = '';
        }
      },

      error: () => {
        this.loading = false;
        this.showMessage('Something went wrong');
      }
    });
}

  // ======================
  // Image Upload
  // ======================
  onFileChange(event: any): void {

    const file = event.target.files[0];

    if (!file) {
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  // ======================
  // Save / Update
  // ======================
    saveAboutUs(form: NgForm): void {

    if (form.invalid) {
      return;
    }

    this.loading = true;

    const formData = new FormData();

    formData.append('id', this.about.id ? String(this.about.id) : '');
    formData.append('master_id', '13');
    formData.append('title', this.about.title || '');
    formData.append('sub_title', this.about.sub_title || '');
    formData.append('description', this.about.description || '');
    formData.append('vision', this.about.vision || '');
    formData.append('mission', this.about.mission || '');
    formData.append(
      'chairman_message',
      this.about.chairman_message || ''
    );

    if (this.selectedFile) {
      formData.append(
        'image',
        this.selectedFile,
        this.selectedFile.name
      );
    }

    // Debug
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.apiService
      .request('POST', '/saveAndUpdateAboutUs', formData)
      .subscribe({

        next: (res: any) => {

          this.loading = false;

          console.log('Save response:', res);

          if (res.status) {

            this.showMessage(
              res.message || 'About Us updated successfully'
            );

            this.getAboutUs();

            this.selectedFile = null;

            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }

          } else {

            this.showMessage(
              res.message || 'Unable to save About Us'
            );

          }
        },

        error: (error: any) => {

          this.loading = false;

          console.error('Save About Us Error:', error);

          console.error('Status:', error.status);
          console.error('Response:', error.error);

          this.showMessage(
            error.error?.message ||
            'Something went wrong while saving'
          );
        }
      });
  }

  // ======================
  // Message
  // ======================
  showMessage(msg: string): void {

    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }

  // ======================
  // Reset
  // ======================
  resetForm(form: NgForm): void {

    form.resetForm();

    this.resetAboutObject();

    this.selectedFile = null;
    this.imagePreview = '';

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // ======================
  // Reset Object
  // ======================
  resetAboutObject(): void {

    this.about = {
      id: '',
      title: '',
      sub_title: '',
      description: '',
      vision: '',
      mission: '',
      chairman_message: '',
      image: '',
    };
  }

  // ======================
  // Back
  // ======================
  handleBackBtn(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}