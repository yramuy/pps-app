
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

  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  // =========================
  // File Inputs
  // =========================

  @ViewChild('fileInput')
  fileInput!: ElementRef;

  @ViewChild('fileInput1')
  fileInput1!: ElementRef;


  // =========================
  // CKEditor
  // =========================

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
      'redo'
    ],

    placeholder: 'Enter content here...'

  };


  // =========================
  // About Object
  // =========================

  about: any = {

    id: '',

    title: '',

    sub_title: '',

    description: '',

    vision: '',

    mission: '',

    aim: '',

    chairman_message: '',

    image: '',

    image1: ''

  };


  // =========================
  // Selected Files
  // =========================

  selectedFile: File | null = null;

  selectedFile1: File | null = null;


  // =========================
  // Image Preview
  // =========================

  imagePreview: string = '';

  image1Preview: string = '';


  // =========================
  // Loading / Message
  // =========================

  loading: boolean = false;

  isMessage: boolean = false;

  message: string = '';


  // =========================
  // Constructor
  // =========================

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}


  // =========================
  // On Init
  // =========================

  ngOnInit(): void {

    this.getAboutUs();

  }


  // =========================
  // Get About Us
  // =========================

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


            // =========================
            // Set About Data
            // =========================

            this.about = {

              id: data.id || '',

              title: data.title || '',

              sub_title:
                data.sub_title || '',

              description:
                data.description || '',


              vision:
                data.vision || '',

              mission:
                data.mission || '',

              aim:
                data.aim || '',

              chairman_message:
                data.chairman_message || '',

              image:
                data.image || '',

              image1:
                data.image1 || ''

            };


            // =========================
            // Existing Image
            // =========================

            this.imagePreview =
              data.image || '';


            // =========================
            // Existing Image 1
            // =========================

            this.image1Preview =
              data.image1 || '';

          }

          else {

            this.resetAboutObject();

          }

        },


        error: (error: any) => {

          this.loading = false;

          console.error(
            'Get About Us Error:',
            error
          );

          this.showMessage(
            'Something went wrong while loading About Us'
          );

        }

      });

  }


  // =========================
  // Image Upload
  // =========================

  onFileChange(
    event: any,
    imageType: string
  ): void {

    const file =
      event.target.files?.[0];


    if (!file) {

      return;

    }


    // =========================
    // Validate Image
    // =========================

    if (
      !file.type ||
      !file.type.startsWith('image/')
    ) {

      this.showMessage(
        'Only image files are allowed'
      );


      if (imageType === 'image') {

        this.fileInput.nativeElement.value = '';

      }

      else if (imageType === 'image1') {

        this.fileInput1.nativeElement.value = '';

      }


      return;

    }


    // =========================
    // About Image
    // =========================

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


    // =========================
    // About Image 1
    // =========================

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


  // =========================
  // Save / Update
  // =========================

  saveAboutUs(form: NgForm): void {

    // =========================
    // Form Validation
    // =========================

    if (form.invalid) {

      return;

    }


    this.loading = true;


    // =========================
    // FormData
    // =========================

    const formData =
      new FormData();


    // =========================
    // ID
    // =========================

    formData.append(
      'id',
      this.about.id
        ? String(this.about.id)
        : ''
    );


    // =========================
    // Master ID
    // =========================

    formData.append(
      'master_id',
      '13'
    );


    // =========================
    // Title
    // =========================

    formData.append(
      'title',
      this.about.title || ''
    );


    // =========================
    // Sub Title
    // =========================

    formData.append(
      'sub_title',
      this.about.sub_title || ''
    );


    // =========================
    // Description
    // =========================

    formData.append(
      'description',
      this.about.description || ''
    );


    // =========================
    // Vision
    // =========================

    formData.append(
      'vision',
      this.about.vision || ''
    );


    // =========================
    // Mission
    // =========================

    formData.append(
      'mission',
      this.about.mission || ''
    );


    // =========================
    // Aim
    // =========================

    formData.append(
      'aim',
      this.about.aim || ''
    );


    // =========================
    // Chairman Message
    // =========================

    formData.append(
      'chairman_message',
      this.about.chairman_message || ''
    );


    // =========================
    // Image
    // =========================

    if (this.selectedFile) {

      formData.append(
        'image',
        this.selectedFile,
        this.selectedFile.name
      );

    }


    // =========================
    // Image 1
    // =========================

    if (this.selectedFile1) {

      formData.append(
        'image1',
        this.selectedFile1,
        this.selectedFile1.name
      );

    }


    // =========================
    // Debug FormData
    // =========================

    formData.forEach(
      (value, key) => {

        console.log(
          key,
          value
        );

      }
    );


    // =========================
    // API
    // =========================

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


          // =========================
          // Success
          // =========================

          if (res.status) {

            this.showMessage(
              res.message ||
              'About Us updated successfully'
            );


            // Reload data
            this.getAboutUs();


            // Clear selected files
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

          // =========================
          // Failed
          // =========================

          else {

            this.showMessage(
              res.message ||
              'Unable to save About Us'
            );

          }

        },


        // =========================
        // API Error
        // =========================

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


  // =========================
  // Show Message
  // =========================

  showMessage(
    msg: string
  ): void {

    this.message = msg;

    this.isMessage = true;


    setTimeout(() => {

      this.isMessage = false;

    }, 3000);

  }


  // =========================
  // Reset Form
  // =========================

  resetForm(
    form: NgForm
  ): void {

    form.resetForm();


    this.resetAboutObject();


    this.selectedFile = null;

    this.selectedFile1 = null;


    this.imagePreview = '';

    this.image1Preview = '';


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


  // =========================
  // Reset About Object
  // =========================

  resetAboutObject(): void {

    this.about = {

      id: '',

      title: '',

      sub_title: '',

      description: '',
      
      vision: '',

      mission: '',

      aim: '',

      chairman_message: '',

      image: '',

      image1: ''

    };


    this.imagePreview = '';

    this.image1Preview = '';

  }


  // =========================
  // Back
  // =========================

  handleBackBtn(): void {

    this.router.navigate([
      '/admin/dashboard'
    ]);

  }

}

