import { Component, ElementRef, ViewChild } from '@angular/core';

import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.scss'],
})
export class UsersAddComponent {
  // =========================================================
  // CKEDITOR
  // =========================================================

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

    placeholder: 'Enter content here...',
  };

  // =========================================================
  // FORM / COMMON VARIABLES
  // =========================================================

  formData: any = {};

  message: string = '';

  isMessage: boolean = false;

  isSaving: boolean = false;

  isEdit: boolean = false;

  // =========================================================
  // DROPDOWN DATA
  // =========================================================

  states: any[] = [];

  districts: any[] = [];

  assemblies: any[] = [];

  mandals: any[] = [];

  villages: any[] = [];

  userRoles: any[] = [];

  // =========================================================
  // LOGIN USER
  // =========================================================

  createdBy: any = '';

  loginUser: any;

  // =========================================================
  // USER MODEL
  // =========================================================

  user: any = {
    id: '',

    user_role_id: '',

    full_name: '',

    user_name: '',

    password: '',

    email: '',

    mobile: '',

    registration_date: '',

    aadhar_card_number: '',

    aadhar_document: '',

    state_id: '',

    district_id: '',

    assembly_id: '',

    mandal_id: '',

    village_id: '',

    profile_pic: '',

    // =====================================================
    // BIOGRAPHY DETAILS
    // =====================================================

    personal_information: '',

    about: '',

    areas_of_interest: '',

    achievements: '',

    // =====================================================
    // COMMON API VALUES
    // =====================================================

    master_id: '8',

    mode: 'web',
  };

  // =========================================================
  // FILE UPLOAD
  // =========================================================

  selectedFile: File | null = null;

  imagePreview: string | ArrayBuffer | null = null;

  selectedAadharFile: File | null = null;

  aadharDocumentPreview: string | null = null;

  // =========================================================
  // API BASE URL
  // =========================================================

  baseUrl = 'https://civsp.in/pps';

  // =========================================================
  // VIEW CHILD
  // =========================================================

  @ViewChild('aadharFileInput')
  aadharFileInput!: ElementRef;

  @ViewChild('fileInput')
  fileInput!: ElementRef;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  // =========================================================
  // NG ON INIT
  // =========================================================

  ngOnInit() {
    // Load master data
    this.loadStates();

    this.loadUserRoles();

    // Get router state
    const state: any = history.state;

    // =====================================================
    // EDIT USER
    // =====================================================

    if (state.user) {
      this.user = {
        ...this.user,
        ...state.user,

        master_id: 8,

        mode: 'web',
      };

      this.isEdit = state.isEdit;

      // =================================================
      // Backward compatibility
      //
      // If old records contain bio_graphy,
      // display it under About.
      // =================================================

      if (!this.user.about && this.user.bio_graphy) {
        this.user.about = this.user.bio_graphy;
      }

      // =================================================
      // Load dependent dropdowns
      // =================================================

      if (this.user.state_id) {
        this.loadDistricts(this.user.state_id);
      }

      if (this.user.district_id) {
        this.loadAssemblies(this.user.district_id);
      }

      if (this.user.assembly_id) {
        this.loadMandals(this.user.assembly_id);
      }

      if (this.user.mandal_id) {
        this.loadVillages(this.user.mandal_id);
      }
    }

    // =====================================================
    // LOGIN USER
    // =====================================================

    this.authService.user$.subscribe((lUser) => {
      this.loginUser = lUser;
    });
  }

  // =========================================================
  // PROFILE IMAGE CHANGE
  // =========================================================

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;

      // Preview
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreview = reader.result;
      };

      reader.readAsDataURL(file);
    } else {
      alert('Only image files are allowed');

      event.target.value = '';

      this.selectedFile = null;

      this.imagePreview = null;
    }
  }

  // =========================================================
  // RESET PROFILE IMAGE
  // =========================================================

  resetImage(removeExisting: boolean = false) {
    // Clear selected file
    this.selectedFile = null;

    this.imagePreview = null;

    // Clear file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // Remove existing image
    if (removeExisting) {
      this.user.profile_pic = '';
    }
  }

  // =========================================================
  // AADHAAR DOCUMENT CHANGE
  // =========================================================

  onAadharFileChange(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'application/pdf',

      'image/jpeg',

      'image/jpg',

      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPG, JPEG and PNG files are allowed');

      event.target.value = '';

      this.selectedAadharFile = null;

      return;
    }

    this.selectedAadharFile = file;
  }

  // =========================================================
  // RESET AADHAAR DOCUMENT
  // =========================================================

  resetAadharDocument(removeExisting: boolean = false) {
    this.selectedAadharFile = null;

    // Clear file input
    if (this.aadharFileInput) {
      this.aadharFileInput.nativeElement.value = '';
    }

    // Remove existing document
    if (removeExisting) {
      this.user.aadhar_document = '';
    }
  }

  // =========================================================
  // LOAD USER ROLES
  // =========================================================

  loadUserRoles() {
    const payload = JSON.stringify({
      master_id: 7,

      mode: 'web',
    });

    this.apiService.request('POST', '/masterData', payload).subscribe({
      next: (res: any) => {
        this.userRoles = res.master_data || [];
      },

      error: (err: any) => {
        this.handleApiError(err);
      },
    });
  }

  // =========================================================
  // LOAD STATES
  // =========================================================

  loadStates() {
    const payload = JSON.stringify({
      master_id: 2,

      mode: 'web',
    });

    this.apiService.request('POST', '/masterData', payload).subscribe({
      next: (res: any) => {
        this.states = res.master_data || [];
      },

      error: (err: any) => {
        this.handleApiError(err);
      },
    });
  }

  // =========================================================
  // LOAD DISTRICTS
  // =========================================================

  loadDistricts(stateId: any) {
    if (!stateId) {
      this.districts = [];

      this.assemblies = [];

      this.mandals = [];

      this.villages = [];

      this.user.district_id = '';

      this.user.assembly_id = '';

      this.user.mandal_id = '';

      this.user.village_id = '';

      return;
    }

    const payload = JSON.stringify({
      master_id: 3,

      dropdown_id: stateId,

      mode: 'web',
    });

    console.log('District Payload:', payload);

    this.apiService
      .request('POST', '/dependanceMasterData', payload)
      .subscribe({
        next: (res: any) => {
          this.districts = res.dependance_master_data || [];
        },

        error: (err: any) => {
          this.handleApiError(err);
        },
      });
  }

  // =========================================================
  // LOAD ASSEMBLIES
  // =========================================================

  loadAssemblies(districtId: any) {
    if (!districtId) {
      this.assemblies = [];

      this.mandals = [];

      this.villages = [];

      this.user.assembly_id = '';

      this.user.mandal_id = '';

      this.user.village_id = '';

      return;
    }

    const payload = JSON.stringify({
      master_id: 4,

      dropdown_id: districtId,

      mode: 'web',
    });

    console.log('Assembly Payload:', payload);

    this.apiService
      .request('POST', '/dependanceMasterData', payload)
      .subscribe({
        next: (res: any) => {
          this.assemblies = res.dependance_master_data || [];
        },

        error: (err: any) => {
          this.handleApiError(err);
        },
      });
  }

  // =========================================================
  // LOAD MANDALS
  // =========================================================

  loadMandals(assemblyId: any) {
    if (!assemblyId) {
      this.mandals = [];

      this.villages = [];

      this.user.mandal_id = '';

      this.user.village_id = '';

      return;
    }

    const payload = JSON.stringify({
      master_id: 5,

      dropdown_id: assemblyId,

      mode: 'web',
    });

    console.log('Mandal Payload:', payload);

    this.apiService
      .request('POST', '/dependanceMasterData', payload)
      .subscribe({
        next: (res: any) => {
          this.mandals = res.dependance_master_data || [];
        },

        error: (err: any) => {
          this.handleApiError(err);
        },
      });
  }

  // =========================================================
  // LOAD VILLAGES
  // =========================================================

  loadVillages(mandalId: any) {
    if (!mandalId) {
      this.villages = [];

      this.user.village_id = '';

      return;
    }

    const payload = JSON.stringify({
      master_id: 6,

      dropdown_id: mandalId,

      mode: 'web',
    });

    console.log('Village Payload:', payload);

    this.apiService
      .request('POST', '/dependanceMasterData', payload)
      .subscribe({
        next: (res: any) => {
          this.villages = res.dependance_master_data || [];
        },

        error: (err: any) => {
          this.handleApiError(err);
        },
      });
  }

  // =========================================================
  // SAVE USER
  // =========================================================

  saveUser(form: NgForm) {
    // Prevent duplicate submit
    if (form.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;

    const formData = new FormData();

    // =====================================================
    // ADD FORM VALUES
    // =====================================================

    Object.entries(form.value).forEach(([key, value]) => {
      // Do not append undefined/null
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    // =====================================================
    // COMMON VALUES
    // =====================================================

    formData.append('id', this.user.id ?? '');

    formData.append('master_id', '8');

    formData.append('mode', 'web');

    formData.append('created_by', this.loginUser?.userId ?? '');

    // =====================================================
    // BIOGRAPHY VALUES
    //
    // Explicitly append them so they are always sent,
    // including empty values.
    // =====================================================

    formData.set('personal_information', this.user.personal_information ?? '');

    formData.set('about', this.user.about ?? '');

    formData.set('areas_of_interest', this.user.areas_of_interest ?? '');

    formData.set('achievements', this.user.achievements ?? '');

    // =====================================================
    // PROFILE IMAGE
    // =====================================================

    if (this.selectedFile) {
      formData.append('profile_pic', this.selectedFile);
    }

    // =====================================================
    // AADHAAR DOCUMENT
    // =====================================================

    if (this.selectedAadharFile) {
      formData.append('aadhar_document', this.selectedAadharFile);
    }

    // =====================================================
    // DEBUG FORM DATA
    // =====================================================

    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(key, value.name);
      } else {
        console.log(key, value);
      }
    });

    // =====================================================
    // API REQUEST
    // =====================================================

    this.apiService.request('POST', '/saveAndUpdateUser', formData).subscribe({
      next: (res: any) => {
        this.isSaving = false;

        if (res.status) {
          this.router.navigate(['/admin/users/list'], {
            state: {
              message: res?.message || 'User saved successfully',
            },
          });
        } else {
          this.showMessage(res?.message || 'Unable to save user');
        }
      },

      error: (err: any) => {
        this.isSaving = false;

        this.handleApiError(err);
      },
    });
  }

  // =========================================================
  // BACK BUTTON
  // =========================================================

  handleBackBtn() {
    this.router.navigate(['/admin/users/list']);
  }

  // =========================================================
  // API ERROR HANDLER
  // =========================================================

  handleApiError(err: any) {
    if (err.status === 401) {
      this.showMessage('Token expired');

      this.authService.logout();
    } else if (err.status === 400) {
      this.showMessage('Invalid request data');
    } else if (err.status === 500) {
      this.showMessage('Server error. Please try again later');
    } else {
      this.showMessage('Something went wrong. Please try again later');
    }
  }

  // =========================================================
  // SHOW MESSAGE
  // =========================================================

  showMessage(msg: string) {
    this.message = msg;

    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
