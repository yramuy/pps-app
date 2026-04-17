import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-roles-add',
  templateUrl: './user-roles-add.component.html',
  styleUrls: ['./user-roles-add.component.scss'],
})
export class UserRolesAddComponent {
  formData: any = {};
  message: string = '';
  isMessage: boolean = false;

  userRole: any = {
    id: '',
    name: '',
    master_id: '7',
  };

  isEdit: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const state: any = history.state;

    if (state.userRole) {
      this.userRole = {
        ...state.userRole,
        master_id: 1,
      };
      this.isEdit = state.isEdit;
    }
  }

  // ✅ Save function
  saveUserRole(form: NgForm) {
    if (form.invalid) {
      return;
    }

    console.log('Payload:', this.userRole);

    this.apiService
      .request('POST', '/saveAndUpdateUserRole', this.userRole)
      .subscribe({
        next: (res: any) => {
          this.router.navigate(['/admin/userRole/list'], {
            state: { message: res?.message || 'UserRole saved successfully' },
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
    this.router.navigate(['/admin/userRole/list']);
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
