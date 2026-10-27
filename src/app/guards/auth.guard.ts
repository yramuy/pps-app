import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';

function checkAuthentication(): boolean | ReturnType<Router['createUrlTree']> {
  const authService = inject(AuthService);
  const globalService = inject(GlobalService);
  const router = inject(Router);

  if (
    !authService.getToken() ||
    authService.isTokenExpired() ||
    !authService.getUser()
  ) {
    authService.logout();
    globalService.setIssueID(0);
    globalService.setIsIssueLogin(false);

    return router.createUrlTree(['/admin/login']);
  }

  return true;
}

export const authGuard: CanActivateFn = () => {
  return checkAuthentication();
};

export const authChildGuard: CanActivateChildFn = () => {
  return checkAuthentication();
};