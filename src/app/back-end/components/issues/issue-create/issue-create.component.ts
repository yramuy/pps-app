import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-issue-create',
  templateUrl: './issue-create.component.html',
  styleUrls: ['./issue-create.component.scss'],
})
export class IssueCreateComponent {
  formData: any = {};
  message: string = '';
  isMessage: boolean = false;
  states: any = [];
  districts: any = [];
  assemblies: any = [];
  mandals: any = [];
  issueRoles: any = [];
  villages: any = [];
  createdBy: any = '';
  loginUser: any;
  categories: any = [];
  representatives: any = [];

  issue: any = {
    id: '',
    category_id: '',
    issue_title: '',
    issue_description: '',
    state_id: '',
    district_id: '',
    assembly_id: '',
    mandal_id: '',
    village_id: '',
    assigned_to: '',
    master_id: '9',
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
    this.loadCategories();

    const state: any = history.state;

    if (state.issue) {
      this.issue = {
        ...state.issue,
        master_id: 8,
      };
      this.isEdit = state.isEdit;

      this.loadDistricts(state.issue.state_id);
      this.loadAssemblies(state.issue.district_id);
      this.loadMandals(state.issue.assembly_id);
      this.loadVillages(state.issue.mandal_id);
    }

    this.authService.user$.subscribe((user) => {
      this.loginUser = user;
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

    // if edit mode and issue clicks remove
    if (removeExisting) {
      this.issue.issue_pic = '';
    }
  }

  loadCategories() {
    const payload = JSON.stringify({
      master_id: 1,
      mode: 'web',
    });

    this.apiService.request('POST', '/masterData', payload).subscribe({
      next: (res: any) => {
        this.categories = res.master_data || [];
      },
      error: (err: any) => {
        if (err.status === 401) {
          this.showMessage('Token expired');
          this.authService.setLoginStatus(false);
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
          this.authService.setLoginStatus(false);
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
    this.loadRepresentatives();

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
            this.authService.setLoginStatus(false);
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
    this.loadRepresentatives();

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
            this.authService.setLoginStatus(false);
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
    this.loadRepresentatives();

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
            this.authService.setLoginStatus(false);
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
    this.loadRepresentatives();

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
            this.authService.setLoginStatus(false);
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

  loadRepresentatives() {
    const payload = JSON.stringify({
      state_id: this.issue.state_id,
      district_id: this.issue.district_id,
      assembly_id: this.issue.assembly_id,
      mandal_id: this.issue.mandal_id,
      village_id: this.issue.village_id,
    });

    console.log('Representative Payload : ', payload);

    this.apiService.request('POST', '/usersListByLocation', payload).subscribe({
      next: (res: any) => {
        this.representatives = res.usersList || [];
      },
      error: (err: any) => {
        if (err.status === 401) {
          this.showMessage('Token expired');
          this.authService.setLoginStatus(false);
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
  saveIssue(form: NgForm) {
    if (form.invalid) return;

    const formData = new FormData();

    // ✅ 1. Append form fields
    Object.entries(form.value).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    // ✅ 2. Add extra required keys

    formData.append('id', this.issue.id ?? '');
    formData.append('master_id', '9');
    formData.append('status_id', '1');
    formData.append('comment', 'New issue created');
    formData.append('created_by', this.loginUser?.userId);

    // ✅ 3. Append file
    if (this.selectedFile) {
      formData.append('issue_pic', this.selectedFile);
    }

    // ✅ Debug
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.apiService.request('POST', '/saveAndUpdateIssue', formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.router.navigate(['/admin/issues/my-issues'], {
            state: { message: res?.message || 'Issue saved successfully' },
          });
        } else {
          this.showMessage(res?.message);
        }
      },
      error: (err: any) => {
        if (err.status === 401) {
          this.showMessage('Token expired');
          this.authService.setLoginStatus(false);
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
    this.router.navigate(['/admin/issues/my-issues']);
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
