import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // ทำให้เป็น singleton ทั่วทั้งแอป
})
export class AuthService {
  private userRole: string | null = null;

  constructor() {}

  setRole(role: string) {
    this.userRole = role;
  }

  getRole(): string | null {
    return this.userRole;
  }

  isRole(role: string): boolean {
    return this.userRole === role;
  }

  isLoggedIn(): boolean {
    return this.userRole !== null;
  }
}
