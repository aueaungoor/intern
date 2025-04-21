import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from './login.service';



@Component({
  selector: 'app-login',
  imports: [
    CommonModule,             // ✅ สำหรับ *ngIf, *ngFor
    ReactiveFormsModule,      // ✅ สำหรับ formGroup/formControlName
    RouterModule            // ✅ สำหรับ routerLink และ Router
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // ✅ แก้ styleUrl → styleUrls
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder,
    public router: Router,
    private accountService: AccountService
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
  
      this.accountService.checkLogin(loginData).subscribe({
        next: (res) => {
          console.log('✅ Login success:', res);
  
          // ✅ ตรวจว่ามีค่า username กลับมาจริง
          if (res) {
            localStorage.setItem('isLoggedIn', 'true');
            console.log('🔁 Redirecting...');
            this.router.navigate(['/mainpage']);
          } else {
            alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
          }
        },
        error: (err) => {
          console.error('❌ Login failed:', err);
          alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
      });
    }
  }
  

  
  
}


