import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
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
    private globalService: GlobalService,
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

    //this.authService.loadUserFromStorage();

    if (this.authService.isTokenExpired()) {
      this.authService.logout();

      this.globalService.setIssueID(0);
      this.globalService.setIsIssueLogin(false);

      this.router.navigate(['/admin/login']);
    }

    this.isLoggedIn = this.authService.isLoggedIn();

    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }
  

  toggleMenu(key: string, event: Event) {
    event.preventDefault();
    this.menuState[key] = !this.menuState[key];
  }

  isMenuActive(url: string): boolean {
    return this.router.url.includes(url);
  }

  ngAfterViewInit() {
    $('[data-widget="treeview"]').Treeview('init');
  }
}
