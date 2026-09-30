import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

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

  @ViewChild('fileInput')
  fileInput!: ElementRef;

  @ViewChild('fileInput1')
  fileInput1!: ElementRef;


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

    placeholder:
      'Enter description here...',
  };


  // ======================
  // About Object
  // ======================

  about: any = {

    id: '',

    title: '',

    sub_title: '',

    description: '',

    vision: '',

    mission: '',

    chairman_message: '',

    image: '',

    image1: '',
  };


  // ======================
  // Image Variables
  // ======================

  selectedFile: File | null = null;

  selectedFile1: File | null = null;


  imagePreview = '';

  image1Preview = '';


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


    const payload = {
      mode: '1'
    };


    this.apiService
      .request(
        'POST',
        '/aboutUs',
        payload
      )
      .subscribe({

        next: (res: any) => {

          this.loading = false;


          if (
            res.status &&
            res.data &&
            res.data.length > 0
          ) {

            const data = res.data[0];


            this.about = {

              id: data.id || '',

              title: data.title || '',

              sub_title: data.sub_title || '',

              description: data.description || '',

              vision: data.vision || '',

              mission: data.mission || '',

              chairman_message:
                data.chairman_message || '',

              image: data.image || '',

              image1: data.image1 || ''

            };


            // Existing image
            this.imagePreview =
              data.image || '';


            // Existing image1
            this.image1Preview =
              data.image1 || '';

          }

          else {

            this.resetAboutObject();

          }

        },


        error: () => {

          this.loading = false;

          this.showMessage(
            'Something went wrong'
          );

        }

      });

  }


  // ======================
  // Image Upload
  // ======================

  onFileChange(
    event: any,
    imageType: string
  ): void {

    const file =
      event.target.files?.[0];


    if (!file) {

      return;

    }


    // Validate image
    if (!file.type.startsWith('image/')) {

      this.showMessage(
        'Only image files are allowed'
      );

      if (imageType === 'image') {

        this.fileInput.nativeElement.value = '';

      }

      else {

        this.fileInput1.nativeElement.value = '';

      }

      return;

    }


    // ======================
    // Image
    // ======================

    if (imageType === 'image') {

      this.selectedFile = file;

      const reader =
        new FileReader();


      reader.onload = (e: any) => {

        this.imagePreview =
          e.target.result;

      };


      reader.readAsDataURL(file);

    }


    // ======================
    // Image 1
    // ======================

    else if (imageType === 'image1') {

      this.selectedFile1 = file;

      const reader =
        new FileReader();


      reader.onload = (e: any) => {

        this.image1Preview =
          e.target.result;

      };


      reader.readAsDataURL(file);

    }

  }


  // ======================
  // Save / Update
  // ======================

  saveAboutUs(form: NgForm): void {

    if (form.invalid) {

      return;

    }


    this.loading = true;


    const formData =
      new FormData();


    formData.append(
      'id',
      this.about.id
        ? String(this.about.id)
        : ''
    );


    formData.append(
      'master_id',
      '13'
    );


    formData.append(
      'title',
      this.about.title || ''
    );


    formData.append(
      'sub_title',
      this.about.sub_title || ''
    );


    formData.append(
      'description',
      this.about.description || ''
    );


    formData.append(
      'vision',
      this.about.vision || ''
    );


    formData.append(
      'mission',
      this.about.mission || ''
    );


    formData.append(
      'chairman_message',
      this.about.chairman_message || ''
    );


    // ======================
    // Image
    // ======================

    if (this.selectedFile) {

      formData.append(
        'image',
        this.selectedFile,
        this.selectedFile.name
      );

    }


    // ======================
    // Image 1
    // ======================

    if (this.selectedFile1) {

      formData.append(
        'image1',
        this.selectedFile1,
        this.selectedFile1.name
      );

    }


    // Debug
    formData.forEach(
      (value, key) => {

        console.log(
          key,
          value
        );

      }
    );


    this.apiService
      .request(
        'POST',
        '/saveAndUpdateAboutUs',
        formData
      )
      .subscribe({

        next: (res: any) => {

          this.loading = false;


          console.log(
            'Save response:',
            res
          );


          if (res.status) {

            this.showMessage(
              res.message ||
              'About Us updated successfully'
            );


            this.getAboutUs();


            this.selectedFile = null;

            this.selectedFile1 = null;


            // Clear image input
            if (this.fileInput) {

              this.fileInput
                .nativeElement
                .value = '';

            }


            // Clear image1 input
            if (this.fileInput1) {

              this.fileInput1
                .nativeElement
                .value = '';

            }

          }

          else {

            this.showMessage(
              res.message ||
              'Unable to save About Us'
            );

          }

        },


        error: (error: any) => {

          this.loading = false;


          console.error(
            'Save About Us Error:',
            error
          );


          console.error(
            'Status:',
            error.status
          );


          console.error(
            'Response:',
            error.error
          );


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

  showMessage(
    msg: string
  ): void {

    this.message = msg;

    this.isMessage = true;


    setTimeout(() => {

      this.isMessage = false;

    }, 3000);

  }


  // ======================
  // Reset
  // ======================

  resetForm(
    form: NgForm
  ): void {

    form.resetForm();


    this.resetAboutObject();


    this.selectedFile = null;

    this.selectedFile1 = null;


    this.imagePreview = '';

    this.image1Preview = '';


    if (this.fileInput) {

      this.fileInput
        .nativeElement
        .value = '';

    }


    if (this.fileInput1) {

      this.fileInput1
        .nativeElement
        .value = '';

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

      image1: ''

    };


    this.imagePreview = '';

    this.image1Preview = '';

  }


  // ======================
  // Back
  // ======================

  handleBackBtn(): void {

    this.router.navigate([
      '/admin/dashboard'
    ]);

  }

}