import {
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

import { NgForm } from '@angular/forms';

import { Router } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';

import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-add-advertisement',

  templateUrl:
    './add-advertisement.component.html',

  styleUrls: [
    './add-advertisement.component.scss'
  ],
})
export class AddAdvertisementComponent {

  // ============================================================
  // MESSAGE
  // ============================================================

  message: string = '';

  isMessage: boolean = false;


  // ============================================================
  // LOGIN USER
  // ============================================================

  loginUser: any;


  // ============================================================
  // ADVERTISEMENT
  // ============================================================

  advertisement: any = {

    id: '0',

    advertisement_title: '',

    advertisement_type: '',

    advertisement_description: '',

    master_id: '15',

    mode: 'web',

  };


  // ============================================================
  // EDIT MODE
  // ============================================================

  isEdit: boolean = false;


  // ============================================================
  // IMAGE
  // ============================================================

  selectedFile: File | null = null;

  imagePreview: string = '';

  existingImage: string = '';


  advertisement_images: any[] = [];


  // ============================================================
  // FILE INPUT
  // ============================================================

  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(

    private apiService: ApiService,

    private authService: AuthService,

    private router: Router,

  ) {}


  // ============================================================
  // NG ON INIT
  // ============================================================

  ngOnInit(): void {

    const state: any = history.state;


    // ==========================================================
    // EDIT ADVERTISEMENT
    // ==========================================================

    if (state.advertisement) {

      this.advertisement =
        state.advertisement;

      this.isEdit = true;


      // --------------------------------------------------------
      // Existing image
      // --------------------------------------------------------

      if (
        this.advertisement.imageUrl
      ) {

        if (
          Array.isArray(
            this.advertisement.imageUrl
          )
        ) {

          this.existingImage =
            this.advertisement.imageUrl[0] || '';

        }
        else if (
          typeof this.advertisement.imageUrl ===
          'string'
        ) {

          this.existingImage =
            this.advertisement.imageUrl;

        }

      }

    }


    // ==========================================================
    // LOGIN USER
    // ==========================================================

    this.authService.user$
      .subscribe(
        (user: any) => {

          this.loginUser = user;

        }
      );

  }


  // ============================================================
  // FILE CHANGE
  // ============================================================

  onFileChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];


    if (!file) {

      return;

    }


    // ----------------------------------------------------------
    // Validate image
    // ----------------------------------------------------------

    if (
      !file.type.startsWith('image/')
    ) {

      this.showMessage(
        'Only image files are allowed'
      );

      this.clearFileInput();

      return;

    }


    // ----------------------------------------------------------
    // Set selected file
    // ----------------------------------------------------------

    this.selectedFile =
      file;


    // ----------------------------------------------------------
    // Preview
    // ----------------------------------------------------------

    const reader =
      new FileReader();


    reader.onload = () => {

      this.imagePreview =
        reader.result as string;


      // New image replaces existing image
      this.existingImage =
        '';

    };


    reader.readAsDataURL(file);


    // Allows same file to be selected again
    this.clearFileInput(false);

  }


  // ============================================================
  // REMOVE SELECTED IMAGE
  // ============================================================

  removeSelectedImage(): void {

    this.selectedFile =
      null;

    this.imagePreview =
      '';

    this.clearFileInput();

  }


  // ============================================================
  // REMOVE EXISTING IMAGE
  // ============================================================

  removeExistingImage(): void {

    this.existingImage =
      '';

    this.advertisement.advertisement_image =
      '';

  }


  // ============================================================
  // RESET IMAGES
  // ============================================================

  resetImages(
    removeExisting: boolean = false
  ): void {

    this.selectedFile =
      null;

    this.imagePreview =
      '';


    if (removeExisting) {

      this.existingImage =
        '';

      this.advertisement.advertisement_image =
        '';

    }


    this.clearFileInput();

  }


  // ============================================================
  // SAVE / UPDATE
  // ============================================================

  saveAdvertisement(
    form: NgForm
  ): void {

    // ----------------------------------------------------------
    // Form validation
    // ----------------------------------------------------------

    if (form.invalid) {

      return;

    }


    // ----------------------------------------------------------
    // Image validation
    // ----------------------------------------------------------

    if (
      !this.selectedFile &&
      !this.existingImage
    ) {

      this.showMessage(
        'At least one advertisement picture is required'
      );

      return;

    }


    // ==========================================================
    // FORM DATA
    // ==========================================================

    const formData =
      new FormData();


    // ----------------------------------------------------------
    // Advertisement fields
    // ----------------------------------------------------------

    Object.keys(
      this.advertisement
    ).forEach(
      (key: string) => {

        if (
          key !== 'advertisement_image'
        ) {

          formData.append(

            key,

            this.advertisement[key] !== null &&
            this.advertisement[key] !== undefined

              ? this.advertisement[key]

              : ''

          );

        }

      }
    );


    // ==========================================================
    // REQUIRED FIELDS
    // ==========================================================

    formData.append(
      'id',
      this.advertisement.id ?? ''
    );


    formData.append(
      'master_id',
      '15'
    );


    formData.append(
      'created_by',
      this.loginUser?.userId ?? ''
    );


    // ==========================================================
    // EXISTING IMAGE
    // ==========================================================

    if (
      !this.selectedFile &&
      this.existingImage
    ) {

      formData.append(
        'existing_image',
        this.existingImage
      );

    }


    // ==========================================================
    // NEW IMAGE
    // ==========================================================

    if (
      this.selectedFile
    ) {

      formData.append(
        'image',
        this.selectedFile
      );

    }


    // ==========================================================
    // DEBUG
    // ==========================================================

    console.log(
      'Advertisement FormData:'
    );


    formData.forEach(
      (
        value: FormDataEntryValue,
        key: string
      ) => {

        console.log(
          key,
          value
        );

      }
    );


    // ==========================================================
    // API
    // ==========================================================

    this.apiService

      .request(
        'POST',
        '/saveAndUpdateAdvertisement',
        formData
      )

      .subscribe({

        // ======================================================
        // SUCCESS
        // ======================================================

        next: (res: any) => {

          console.log(
            'Advertisement response:',
            res
          );


          if (res.status) {

            this.router.navigate(
              [
                '/admin/advertisement/list'
              ],
              {
                state: {

                  message:
                    res.message ||
                    'Advertisement saved successfully',

                },
              }
            );

          }
          else {

            this.showMessage(

              res.message ||
              'Unable to save advertisement'

            );

          }

        },


        // ======================================================
        // ERROR
        // ======================================================

        error: (err: any) => {

          console.error(
            'Advertisement error:',
            err
          );


          if (err.status === 401) {

            this.showMessage(
              'Token expired'
            );

            this.authService.logout();

          }
          else if (err.status === 400) {

            this.showMessage(
              'Invalid request data'
            );

          }
          else if (err.status === 500) {

            this.showMessage(
              'Server error. Please try again later'
            );

          }
          else {

            this.showMessage(
              'Something went wrong'
            );

          }

        }

      });

  }


  // ============================================================
  // BACK
  // ============================================================

  handleBackBtn(): void {

    this.router.navigate(
      [
        '/admin/advertisement/list'
      ]
    );

  }


  // ============================================================
  // MESSAGE
  // ============================================================

  showMessage(
    msg: string
  ): void {

    this.message =
      msg;

    this.isMessage =
      true;


    setTimeout(
      () => {

        this.isMessage =
          false;

      },
      3000
    );

  }


  // ============================================================
  // CLEAR FILE INPUT
  // ============================================================

  private clearFileInput(
    clearPreview: boolean = true
  ): void {

    if (
      this.fileInput
    ) {

      this.fileInput
        .nativeElement
        .value = '';

    }


    if (clearPreview) {

      this.selectedFile =
        null;

      this.imagePreview =
        '';

    }

  }

}