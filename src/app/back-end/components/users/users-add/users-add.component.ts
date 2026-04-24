import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.scss'],
})
export class UsersAddComponent {
  formData: any = {};
  message: string = '';
  isMessage: boolean = false;
  states: any = [];
  districts: any = [];
  assemblies: any = [];
  mandals: any = [];
  userRoles: any = [];
  villages: any = [];
  createdBy: any = '';
  loginUser: any;

  user: any = {
    id: '',
    user_role_id: '',
    full_name: '',
    user_name: '',
    password: '',
    email: '',
    mobile: '',
    state_id: '',
    district_id: '',
    assembly_id: '',
    mandal_id: '',
    village_id: '',
    master_id: '8',
    mode: 'web',
  };

  isEdit: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  baseUrl = 'https://civsp.in/pps'; // change to your server URL

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadStates();
    this.loadUserRoles();

    const state: any = history.state;

    if (state.user) {
      this.user = {
        ...state.user,
        master_id: 8,
      };
      this.isEdit = state.isEdit;

      this.loadDistricts(state.user.state_id);
      this.loadAssemblies(state.user.district_id);
      this.loadMandals(state.user.assembly_id);
      this.loadVillages(state.user.mandal_id);
    }

    this.authService.user$.subscribe((lUser) => {
      this.loginUser = lUser;
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;

      // preview
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

  resetImage(removeExisting: boolean = false) {
    // clear selected file
    this.selectedFile = null;
    this.imagePreview = null;

    // clear file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    // if edit mode and user clicks remove
    if (removeExisting) {
      this.user.profile_pic = '';
    }
  }

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
      },
    });
  }

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
      },
    });
  }

  loadDistricts(stateId: any) {
    const payload = JSON.stringify({
      master_id: 3,
      dropdown_id: stateId,
      mode: 'web',
    });

    console.log('Payload : ', payload);

    this.apiService
      .request('POST', '/dependanceMasterData', payload)
      .subscribe({
        next: (res: any) => {
          this.districts = res.dependance_master_data || [];
        },
        error: (err: any) => {
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
        },
      });
  }

  loadAssemblies(districtId: any) {
    const payload = JSON.stringify({
      master_id: 4,
      dropdown_id: districtId,
      mode: 'web',
    });

    console.log('Payload : ', payload);

    this.apiService
      .request('POST', '/dependanceMasterData', payload)
      .subscribe({
        next: (res: any) => {
          this.assemblies = res.dependance_master_data || [];
        },
        error: (err: any) => {
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
        },
      });
  }

  loadMandals(assemblyId: any) {
    const payload = JSON.stringify({
      master_id: 5,
      dropdown_id: assemblyId,
      mode: 'web',
    });

    console.log('Payload : ', payload);

    this.apiService
      .request('POST', '/dependanceMasterData', payload)
      .subscribe({
        next: (res: any) => {
          this.mandals = res.dependance_master_data || [];
        },
        error: (err: any) => {
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
        },
      });
  }

  loadVillages(mandalId: any) {
    const payload = JSON.stringify({
      master_id: 6,
      dropdown_id: mandalId,
      mode: 'web',
    });

    console.log('Payload : ', payload);

    this.apiService
      .request('POST', '/dependanceMasterData', payload)
      .subscribe({
        next: (res: any) => {
          this.villages = res.dependance_master_data || [];
        },
        error: (err: any) => {
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
        },
      });
  }

  // ✅ Save function
  saveUser(form: NgForm) {
    if (form.invalid) return;

    const formData = new FormData();

    // ✅ 1. Append form fields
    Object.entries(form.value).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    // ✅ 2. Add extra required keys

    formData.append('id', this.user.id ?? '');
    formData.append('master_id', '8');
    formData.append('mode', 'web');
    formData.append('created_by', this.loginUser?.userId);

    // ✅ 3. Append file
    if (this.selectedFile) {
      formData.append('profile_pic', this.selectedFile);
    }

    // ✅ Debug
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.apiService.request('POST', '/saveAndUpdateUser', formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.router.navigate(['/admin/users/list'], {
            state: { message: res?.message || 'User saved successfully' },
          });
        } else {
          this.showMessage(res?.message);
        }
      },
      error: (err: any) => {
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
      },
    });
  }

  handleBackBtn() {
    this.router.navigate(['/admin/users/list']);
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
