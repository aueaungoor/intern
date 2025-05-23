import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account } from '../models/account';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private readonly http: HttpClient) {}

  private apiUrl = 'http://localhost:8080/accounts';

  checkUsernameAvailable(criteria: Account): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/check-username`, criteria);
  }

  createAccount(criteria: Account): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/creat-account`, criteria);
  }
}
