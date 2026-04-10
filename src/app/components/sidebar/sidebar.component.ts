import { Component } from '@angular/core';
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
    daily: false
  };

  constructor(private authService: AuthService) { }

  ngOnInit() {
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

  ngAfterViewInit() {
    $('[data-widget="treeview"]').Treeview('init');
  }
}
