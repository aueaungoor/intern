import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: roleGuard;
  const mockRouter = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [roleGuard, { provide: Router, useValue: mockRouter }],
    });

    guard = TestBed.inject(roleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when role matches', () => {
    localStorage.setItem('userRole', 'admin');

    const mockRoute: any = {
      data: { expectedRole: 'admin' },
    };

    expect(guard.canActivate(mockRoute)).toBeTrue();
  });

  it('should deny access when role does not match', () => {
    localStorage.setItem('userRole', 'user');

    const mockRoute: any = {
      data: { expectedRole: 'admin' },
    };

    expect(guard.canActivate(mockRoute)).toBeFalse();
  });
});
