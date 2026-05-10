import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken()) {
    const user = authService.currentUser();
    if (user?.mustChangePassword && route.routeConfig?.path !== 'change-password') {
      router.navigate(['/change-password']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken() && authService.isAdmin()) {
    const user = authService.currentUser();
    if (user?.mustChangePassword && route.routeConfig?.path !== 'change-password') {
      router.navigate(['/change-password']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const advisorGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken() && authService.isAdvisor()) {
    const user = authService.currentUser();
    if (user?.mustChangePassword && route.routeConfig?.path !== 'change-password') {
      router.navigate(['/change-password']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
