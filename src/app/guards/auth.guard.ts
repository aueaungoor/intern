import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, // ✅ ต้องมี parameter นี้
    state: RouterStateSnapshot
  ): boolean {
    const expectedRole = route.data['expectedRole']; // รับ role จาก route

    if (isPlatformBrowser(this.platformId)) {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        return true;
      } else {
        alert('กรุณาเข้าสู่ระบบก่อน');
        this.router.navigate(['/login']);
        return false;
      }
    }

    if (expectedRole && !this.authService.isRole(expectedRole)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // ถ้าไม่ใช่ browser
    return false;
  }
}
