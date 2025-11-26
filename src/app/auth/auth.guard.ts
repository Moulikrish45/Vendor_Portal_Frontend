import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Check if we saved the Vendor ID during login
  const currentUser = sessionStorage.getItem('currentVendor');

  if (currentUser) {
    return true; // You shall pass
  } else {
    router.navigate(['/login']); // Go back to start
    return false;
  }
};