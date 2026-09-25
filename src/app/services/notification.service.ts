
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  // =========================
  // Notification Count
  // =========================

  private notificationCountSubject =
    new BehaviorSubject<number>(0);

  notificationCount$ =
    this.notificationCountSubject.asObservable();


  // =========================
  // Notification List
  // =========================

  private notificationListSubject =
    new BehaviorSubject<any[]>([]);

  notificationList$ =
    this.notificationListSubject.asObservable();


  // =========================
  // Refresh Event
  // =========================

  private refreshNotificationSubject =
    new Subject<void>();

  refreshNotification$ =
    this.refreshNotificationSubject.asObservable();


  // =========================
  // Count Methods
  // =========================

  setNotificationCount(count: number): void {
    this.notificationCountSubject.next(Number(count) || 0);
  }

  getNotificationCount(): number {
    return this.notificationCountSubject.value;
  }


  // =========================
  // List Methods
  // =========================

  setNotificationList(list: any[]): void {
    this.notificationListSubject.next(list || []);
  }

  getNotificationList(): any[] {
    return this.notificationListSubject.value;
  }


  // =========================
  // Trigger Refresh
  // =========================

  refreshNotificationList(): void {
    console.log('Notification refresh triggered');

    this.refreshNotificationSubject.next();
  }
}
