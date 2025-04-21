// src/app/services/account.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private baseUrl = 'http://localhost:8080/accounts';

  constructor(private http: HttpClient) {}

  checkLogin(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/checkLogin`, data);
  }
}
