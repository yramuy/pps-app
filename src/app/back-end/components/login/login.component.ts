import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  loading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  togglePassword() {
    this.showPassword = !this.showPassword
  }

  login() {

    if (!this.username || !this.password) {
      alert('Username and Password are required');
      return;
    }

    this.loading = true;

    const payload = {
      username: this.username,
      password: this.password
    };

    console.log("Payload :", payload);


    this.authService.login(payload).subscribe({
      next: (res: any) => {

        this.authService.saveToken(res.token);
        this.authService.saveUserData(res);
        // set login status
        this.authService.setLoginStatus(true);

        this.router.navigate(['/admin/dashboard']);

        this.loading = false;
      },
      error: (err) => {
        if (err.status === 401) {
          alert('Invalid username or password');
        } else {
          alert('Something went wrong. Please try again');
        }
        this.loading = false;
      }
    });

  }
}
