import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-villages-add',
  templateUrl: './villages-add.component.html',
  styleUrls: ['./villages-add.component.scss']
})
export class VillagesAddComponent {

  formData: any = {};
    message: string = '';
    isMessage: boolean = false;
    states: any = [];
    districts: any = [];
    assemblies: any = [];
    mandals: any = [];
  
    village: any = {
      id: '',
      name: '',
      state_id: '',
      district_id: '',
      assembly_id: '',
      mandal_id: '',
      master_id: '6',
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
  
      if (state.village) {
        this.village = {
          ...state.village,
          master_id: 6,
        };
        this.isEdit = state.isEdit;
  
        this.loadDistricts(state.village.state_id);
        this.loadAssemblies(state.village.district_id);
        this.loadMandals(state.village.assembly_id);
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
    saveVillage(form: NgForm) {
      if (form.invalid) {
        return;
      }
  
      console.log('Payload:', this.village);
  
      this.apiService
        .request('POST', '/saveAndUpdateVillage', this.village)
        .subscribe({
          next: (res: any) => {
            this.router.navigate(['/admin/village/list'], {
              state: { message: res?.message || 'Village saved successfully' },
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
      this.router.navigate(['/admin/village/list']);
    }
  
    showMessage(msg: string) {
      this.message = msg;
      this.isMessage = true;
  
      setTimeout(() => {
        this.isMessage = false;
      }, 3000);
    }

}
