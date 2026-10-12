import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-website-header',
  templateUrl: './website-header.component.html',
  styleUrls: ['./website-header.component.scss'],
})
export class WebsiteHeaderComponent {
  isScrolled = false;
  isMenuOpen = false;
  isLogin: any = '';
  private destroy$ = new Subject<void>();

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadIsLogin();
  }

  loadIsLogin(): void {
    this.isLogin = this.authService.isLoggedIn() ? 'LOGOUT' : 'LOGIN';
  }

  handleLoginClick(): void {
    if (this.authService.isLoggedIn()) {
      const confirmed = window.confirm('Are you sure you want to logout?');

      if (!confirmed) {
        return;
      }

      this.closeMenu();

      this.authService.logout();
      localStorage.clear();

      // Navigate to Login page
      this.router.navigate(['/admin/login']);
    } else {
      this.closeMenu();

      // Navigate to Website
      this.router.navigate(['/admin/login']);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
