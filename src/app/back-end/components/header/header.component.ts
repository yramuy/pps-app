import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ApiService } from '../../../services/api.service';
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent
  implements OnInit, AfterViewInit, OnDestroy {

  private userSubscription?: Subscription;
  private notificationRefreshSubscription?: Subscription;

  notificationCount = 0;
  notificationList: any[] = [];

  user: any;

  // =========================
  // Biography
  // =========================
  biography: any = {
    fullName: '',
    profilePic: '',
    roleName: '',
    state: '',
    district: '',
    assembly: '',
    mandal: '',
    village: '',
    mobile: '',
    email: '',
    bio_graphy: '',
  };

  showNotifications = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private notificationService: NotificationService,
  ) {}

  ngAfterViewInit(): void {
    $('[data-widget="pushmenu"]').PushMenu();
  }

  ngOnInit(): void {

    // =========================
    // User
    // =========================

    this.userSubscription = this.authService.user$.subscribe((user) => {

      this.user = user;

      console.log('Header User:', user);

      // =========================
      // Biography Data
      // =========================

      if (user) {

        this.biography = {
          fullName: user.fullName || '',
          profilePic: user.profile_pic || '',
          roleName: user.roleName || '',
          state: user.state || '',
          district: user.district || '',
          assembly: user.assembly || '',
          mandal: user.mandal || '',
          village: user.village || '',
          mobile: user.mobile || '',
          email: user.email || '',
          bio_graphy: user.bio_graphy || '',
        };

        console.log(
          'Biography Data:',
          this.biography
        );
      }

      // =========================
      // Notifications
      // =========================

      if (user?.userId) {
        this.loadNotificationList();
      }
    });

    // =========================
    // Global Notification Count
    // =========================

    this.notificationService.notificationCount$.subscribe((count) => {

      console.log(
        'Global notification count:',
        count
      );

      this.notificationCount = count;
    });

    // =========================
    // Global Notification List
    // =========================

    this.notificationService.notificationList$.subscribe((list) => {

      console.log(
        'Global notification list:',
        list
      );

      this.notificationList = list;
    });

    // =========================
    // Refresh Notification List
    // =========================

    this.notificationRefreshSubscription =
      this.notificationService.refreshNotification$.subscribe(() => {

        console.log(
          'Refreshing notification list from Header...'
        );

        if (this.user?.userId) {
          this.loadNotificationList();
        }
      });
  }

  // =========================
  // Load Notifications
  // =========================

  loadNotificationList(): void {

    if (!this.user?.userId) {

      console.log(
        'User ID not available'
      );

      return;
    }

    const payload = {
      assigned_to: this.user.userId,
      is_read: '0',
    };

    console.log(
      'Loading unread notifications:',
      payload
    );

    this.apiService
      .request(
        'POST',
        '/notificationList',
        JSON.stringify(payload)
      )
      .subscribe({

        next: (res: any) => {

          console.log(
            'Notification API response:',
            res
          );

          const list =
            Array.isArray(res.notificationList)
              ? res.notificationList
              : [];

          const count =
            Number(res.count) || 0;

          console.log(
            'Unread notification count:',
            count
          );

          console.log(
            'Unread notification list:',
            list
          );

          // Global count
          this.notificationService
            .setNotificationCount(count);

          // Global list
          this.notificationService
            .setNotificationList(list);

          // Local values
          this.notificationCount = count;
          this.notificationList = list;
        },

        error: (err: any) => {

          console.error(
            'Notification API Error:',
            err
          );
        },
      });
  }

  // =========================
  // View Notification
  // =========================

  handleNotificationClick(
    event: Event,
    issueId: any
  ): void {

    event.preventDefault();
    event.stopPropagation();

    console.log(
      'Notification clicked. Issue ID:',
      issueId
    );

    const payload = {
      issue_id: issueId,
      is_read: 1,
    };

    console.log(
      'Updating notification status:',
      payload
    );

    this.apiService
      .request(
        'POST',
        '/updateNotificationStatus',
        payload
      )
      .subscribe({

        next: (res: any) => {

          console.log(
            'Notification marked as read:',
            res
          );

          this.removeNotificationFromList(
            issueId
          );

          this.loadNotificationList();

          this.showNotifications = false;

          this.router.navigate(
            ['/admin/issues/view-issue'],
            {
              state: {
                issueID: issueId,
              },
            }
          );
        },

        error: (err: any) => {

          console.error(
            'Update notification status error:',
            err
          );

          this.router.navigate(
            ['/admin/issues/view-issue'],
            {
              state: {
                issueID: issueId,
              },
            }
          );
        },
      });
  }

  // =========================
  // Remove Notification
  // =========================

  removeNotificationFromList(
    issueId: any
  ): void {

    const updatedList =
      this.notificationList.filter(
        (notification) =>
          notification.id != issueId
      );

    console.log(
      'Updated notification list:',
      updatedList
    );

    this.notificationList =
      updatedList;

    this.notificationService
      .setNotificationList(
        updatedList
      );

    this.notificationService
      .setNotificationCount(
        updatedList.length
      );
  }

  // =========================
  // Toggle
  // =========================

  toggleNotifications(): void {

    this.showNotifications =
      !this.showNotifications;
  }

  closeNotifications(): void {

    this.showNotifications = false;
  }

  // =========================
  // Logout
  // =========================

  logout(): void {

    const confirmed =
      window.confirm(
        'Are you sure you want to logout?'
      );

    if (!confirmed) {
      return;
    }

    this.authService.logout();

    localStorage.clear();

    this.router.navigate(
      ['/admin/login']
    );
  }

  // =========================
  // Go To Website
  // =========================

  goToWebsite(): void {

    this.authService.logout();

    localStorage.clear();

    this.router.navigate(['/']);
  }

  // =========================
  // Settings
  // =========================

  goToSettings(): void {

    this.router.navigate(
      ['/settings']
    );
  }

  // =========================
  // Profile
  // =========================

  goToProfile(): void {

    this.router.navigate(
      ['/profile']
    );
  }

  // =========================
  // Destroy
  // =========================

  ngOnDestroy(): void {

    this.userSubscription?.unsubscribe();

    this.notificationRefreshSubscription
      ?.unsubscribe();
  }
}