import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class roleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const currentRole = localStorage.getItem('userRole'); // อ่านจาก localStorage

    if (!expectedRole || currentRole === expectedRole) {
      return true;
    }

    return false;
  }
}
