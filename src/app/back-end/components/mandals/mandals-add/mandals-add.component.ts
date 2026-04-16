import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-mandals-add',
  templateUrl: './mandals-add.component.html',
  styleUrls: ['./mandals-add.component.scss'],
})
export class MandalsAddComponent {
  formData: any = {};
  message: string = '';
  isMessage: boolean = false;
  states: any = [];
  districts: any = [];
  assemblies: any = [];

  mandal: any = {
    id: '',
    name: '',
    state_id: '',
    district_id: '',
    assembly_id: '',
    master_id: '5',
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

    if (state.mandal) {
      this.mandal = {
        ...state.mandal,
        master_id: 5,
      };
      this.isEdit = state.isEdit;

      this.loadDistricts(state.mandal.state_id);
      this.loadAssemblies(state.mandal.district_id);
    }
  }

  loadStates() {
    const payload = JSON.stringify({
      master_id: 2,
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

  // ✅ Save function
  saveMandal(form: NgForm) {
    if (form.invalid) {
      return;
    }

    console.log('Payload:', this.mandal);

    this.apiService
      .request('POST', '/saveAndUpdateMandal', this.mandal)
      .subscribe({
        next: (res: any) => {
          this.router.navigate(['/admin/mandal/list'], {
            state: { message: res?.message || 'Mandal saved successfully' },
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
    this.router.navigate(['/admin/mandal/list']);
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
