import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  isLoggedIn = false;
  user: any;
  menuState: any = {
    config: false,
    reports: false,
    daily: false,
  };

  constructor(
    private authService: AuthService,
    public router: Router,
  ) { }

  ngOnInit() {
    //const url = this.router.url;

    // Configuration menu
    // if (
    //   url.includes('/admin/category') ||
    //   url.includes('/admin/states') ||
    //   url.includes('/admin/districts') ||
    //   url.includes('/admin/assemblies') ||
    //   url.includes('/admin/mandals') ||
    //   url.includes('/admin/villages')
    // ) {
    //   this.menuState.config = true;
    // }

    this.authService.loadUserFromStorage();

    this.isLoggedIn = this.authService.isLoggedIn();

    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  toggleMenu(key: string, event: Event) {
    event.preventDefault();
    this.menuState[key] = !this.menuState[key];
  }

  isCategoryActive(): boolean {
    return this.router.url.includes('/admin/category');
  }

  ngAfterViewInit() {
    $('[data-widget="treeview"]').Treeview('init');
  }
}
