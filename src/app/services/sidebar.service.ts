import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private sidebarState = new BehaviorSubject<boolean>(false);

  sidebarOpen$ = this.sidebarState.asObservable();

  toggle(): void {
    this.sidebarState.next(!this.sidebarState.value);
  }

  open(): void {
    this.sidebarState.next(true);
  }

  close(): void {
    this.sidebarState.next(false);
  }
}