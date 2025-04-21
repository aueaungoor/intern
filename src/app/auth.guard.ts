import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
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

    // ถ้าไม่ใช่ browser
    return false;
  }
}
