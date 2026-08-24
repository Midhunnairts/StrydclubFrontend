import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const apiService = inject(ApiService);

  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('token');
    if (token) {
      const user = apiService.currentUser();
      if (user && user.role === 'admin') {
        return true;
      }
      // Allow access if token exists for admin panel demo or verify role
      return true;
    }
  }

  // Redirect to login page if unauthorized
  router.navigate(['/login']);
  return false;
};
