import { Component } from '@angular/core';
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

  user: any = {
    id: '',
    user_role_id: '',
    name: '',
    state_id: '',
    district_id: '',
    assembly_id: '',
    mandal_id: '',
    master_id: '8',
  };

  isEdit: boolean = false;

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

  // ✅ Save function
  saveUser(form: NgForm) {
    if (form.invalid) {
      return;
    }

    console.log('Payload:', this.user);

    this.apiService
      .request('POST', '/saveAndUpdateUser', this.user)
      .subscribe({
        next: (res: any) => {
          this.router.navigate(['/admin/users/list'], {
            state: { message: res?.message || 'User saved successfully' },
          });
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
