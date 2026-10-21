import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  constructor() {}

  /// =========================
  // Issue ID Methods
  // =========================

  private issueIDSubject = new BehaviorSubject<number>(0);

  issueID$ = this.issueIDSubject.asObservable();

  setIssueID(id: number): void {
    this.issueIDSubject.next(Number(id) || 0);
  }

  getIssueID(): number {
    return this.issueIDSubject.value;
  }

  // Is Login from Issue

  private isIssueLoginSubject = new BehaviorSubject<boolean>(false);

  isIssueLogin$ = this.isIssueLoginSubject.asObservable();

  setIsIssueLogin(isLogin: boolean): void {
    this.isIssueLoginSubject.next(Boolean(isLogin));
  }

  getIsIssueLogin(): boolean {
    return this.isIssueLoginSubject.value;
  }


}
