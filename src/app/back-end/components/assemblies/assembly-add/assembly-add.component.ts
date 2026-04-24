import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-assembly-add',
  templateUrl: './assembly-add.component.html',
  styleUrls: ['./assembly-add.component.scss'],
})
export class AssemblyAddComponent {
  formData: any = {};
  message: string = '';
  isMessage: boolean = false;
  states: any = [];
  districts: any = [];

  assembly: any = {
    id: '',
    name: '',
    state_id: '',
    district_id: '',
    code: '',
    master_id: '4',
  };

  isEdit: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadStates();

    const state: any = history.state;

    if (state.assembly) {
      this.assembly = {
        ...state.assembly,
        master_id: 4,
      };
      this.isEdit = state.isEdit;

      this.loadDistricts(state.assembly.state_id);
    }
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

  // ✅ Save function
  saveAssembly(form: NgForm) {
    if (form.invalid) {
      return;
    }

    console.log('Payload:', this.assembly);

    this.apiService
      .request('POST', '/saveAndUpdateAssembly', this.assembly)
      .subscribe({
        next: (res: any) => {
          this.router.navigate(['/admin/assembly/list'], {
            state: { message: res?.message || 'Assembly saved successfully' },
          });
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
    this.router.navigate(['/admin/assembly/list']);
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
