import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountResponse } from '../../../model-response/accountResponse';
import { Account } from '../../../models/account';
import { AccountService } from './login.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, // ✅ สำหรับ *ngIf, *ngFor
    ReactiveFormsModule, // ✅ สำหรับ formGroup/formControlName
    RouterModule, // ✅ สำหรับ routerLink และ Router
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // ✅ แก้ styleUrl → styleUrls
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private accountService: AccountService
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      password: [''],
    });
  }

  // For Varable
  loginSuccess = false;
  loginFailed = false;

  // For Object
  account!: Account;
  response!: AccountResponse;

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.accountService.checkLogin(loginData).subscribe({
        next: (response) => {
          console.log('✅ Login success:', response);

          // ✅ ตรวจว่ามีค่า username กลับมาจริง
          if (response.message == 'ดึงข้อมูลสำเร็จ') {
            localStorage.setItem('isLoggedIn', 'true');

            if (response.data.isAdmin == true) {
              this.router.navigate(['/mainpage']).then(() => {
                setTimeout(() => {
                  this.loginSuccess = false;
                }, 1000); // ✅ รอ 1 วินาทีแล้วปิด popup
              });
            } else {
              this.router
                .navigate(['/profile', response.data.idaccount])
                .then(() => {
                  setTimeout(() => {
                    this.loginSuccess = false;
                  }, 1000); // ✅ รอ 1 วินาทีแล้วปิด popup
                });
            }

            this.loginSuccess = true;
            this.loginFailed = false;
          } else {
            this.loginSuccess = false;
            this.loginFailed = true;
          }
        },
      });
    }

    setTimeout(() => {
      this.loginFailed = false;
    }, 2000);
  }

  showPassword = false;

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  closeAlert() {
    this.loginSuccess = false;
    this.loginFailed = false;
  }
}
