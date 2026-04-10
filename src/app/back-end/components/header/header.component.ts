
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private router: Router, private authService: AuthService) {}

  ngAfterViewInit() {
    $('[data-widget="pushmenu"]').PushMenu();
  }

  logout() {

    this.authService.setLoginStatus(false);
    // clear session/local storage
    localStorage.clear();

    // redirect to login
    this.router.navigate(['/login']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
