import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-category-add',
  templateUrl: './category-add.component.html',
  styleUrls: ['./category-add.component.scss'],
})
export class CategoryAddComponent {
  formData: any = {};
  message: string = '';
  isMessage: boolean = false;
  category: any = {
    id: '',
    name: '',
  };
  isEdit: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const state: any = history.state;

    if (state.category) {
      this.category = state.category;
      this.isEdit = state.isEdit;
    }
  }

  // ✅ Save function
  saveCategory(form: NgForm) {
    if (form.invalid) {
      return;
    }

    console.log('Payload:', this.category);

    this.apiService
      .request('POST', '/saveAndUpdateCat', this.category)
      .subscribe({
        next: (res: any) => {
          this.router.navigate(['/admin/category/list'], {
            state: { message: res?.message || 'Category saved successfully' },
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
    this.router.navigate(['/admin/category/list']);
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
