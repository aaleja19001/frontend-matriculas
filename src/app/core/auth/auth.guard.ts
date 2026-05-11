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

export const studentGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Un estudiante es alguien que tiene token pero no es admin ni asesor
  // O específicamente tiene ROLE_USER y nada más. 
  // Por ahora, permitimos si tiene token y no es admin ni asesor (o si queremos ser explícitos)
  if (authService.hasToken() && !authService.isAdmin() && !authService.isAdvisor()) {
    const user = authService.currentUser();
    if (user?.mustChangePassword && route.routeConfig?.path !== 'change-password') {
      router.navigate(['/change-password']);
      return false;
    }
    return true;
  }

  if (authService.hasToken()) {
    // Si tiene token pero es Admin/Asesor y trata de entrar a /student, 
    // lo mandamos a su dashboard correspondiente
    if (authService.isAdmin()) router.navigate(['/admin/dashboard']);
    else if (authService.isAdvisor()) router.navigate(['/advisor/dashboard']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};
