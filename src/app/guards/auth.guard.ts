import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const apiService = inject(ApiService);

  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('token');
    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    const user = apiService.currentUser();
    if (user) {
      return true;
    }

    const profileObs = apiService.getUserProfile(token);
    if (!profileObs) {
      router.navigate(['/login']);
      return false;
    }

    return profileObs.pipe(
      map(res => {
        if (res && res.success && res.user) {
          apiService.currentUser.set(res.user);
          return true;
        }
        apiService.logout();
        router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        apiService.logout();
        router.navigate(['/login']);
        return of(false);
      })
    );
  }

  // Redirect to login page if unauthorized
  router.navigate(['/login']);
  return false;
};
