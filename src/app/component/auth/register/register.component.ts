import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Account } from '../../../models/account';
import { AccountService } from '../../../services/AccountService';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, RouterModule],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private readonly accountService: AccountService
  ) {
    this.maxDate = this.getToday(); // ✅ move here
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, this.passwordValidator]],
      fname: ['', [Validators.required]],
      lname: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      birthday: ['', [Validators.required]],
    });
  }

  // For valable
  maxDate: String;
  previewImage: string | null = null;
  selectedFile: File | null = null;
  usernameTaken: boolean = false;
  showPassword = false;
  passwordStrength = 0;
  isLoading = false;
  showSuccess = false;
  passwordFocus = false;
  hasUpper = false;
  hasLower = false;
  hasNumber = false;
  hasSpecial = false;
  isLongEnough = false;

  // For Object
  criteria: Account = {
    username: '',
  };

  onSubmit(): void {
    if (this.registerForm.valid && this.selectedFile) {
      const account = this.registerForm.value;
      console.log('✅ Register Form Data:', account);

      const formData = new FormData();

      const rawDate = new Date(account.birthday);
      const year = rawDate.getFullYear();
      const month = (rawDate.getMonth() + 1).toString().padStart(2, '0');
      const day = rawDate.getDate().toString().padStart(2, '0');
      account.birthday = `${year}-${month}-${day}`;

      // 👇 แปลง account object เป็น JSON แล้วใส่ลง Blob
      const accountBlob = new Blob([JSON.stringify(account)], {
        type: 'application/json',
      });
      formData.append('account', accountBlob);

      // 👇 แนบไฟล์รูปภาพ
      formData.append('file', this.selectedFile);

      console.log('fromdata -> {}', formData);

      // 👇 ส่ง multipart ไป backend
      this.http
        .post('http://localhost:8080/accounts', formData, {
          responseType: 'text',
        })
        .subscribe({
          next: (res) => {
            console.log('✅ Register success:', res);
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('❌ Register failed:', err);
          },
        });
    } else {
      console.warn('⚠️ Form is not valid or no file selected');
    }
  }

  onSave(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.accountService.createAccount(this.registerForm.value).subscribe({
        next: (res) => {
          console.log('✅ Account created:', res);
          this.isLoading = false;
          this.showSuccess = true;
        },
        error: (err) => {
          console.error('❌ Account creation failed:', err);
          this.isLoading = false;
        },
      });
    }
  }

  closeSuccessModal() {
    this.showSuccess = false;
    this.router.navigate(['/login']);
  }

  getToday(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // 👉 รูปแบบ yyyy-MM-dd
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(value);
    const isValidLength = value.length >= 8;

    const isValid =
      hasUpper && hasLower && hasNumber && hasSpecial && isValidLength;

    return isValid ? null : { passwordStrength: true };
  }

  checkUsername(value: string) {
    this.criteria.username = value;

    this.accountService
      .checkUsernameAvailable(this.criteria)
      .subscribe((result) => {
        if (result.available) {
          this.usernameTaken = false;
        } else {
          this.usernameTaken = true;
        }
      });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  evaluatePasswordStrength(password: string) {
    let score = 0;

    if (password.length >= 8) score += 1;

    // มีตัวพิมพ์ใหญ่
    if (/[A-Z]/.test(password)) score += 1;

    // มีตัวเลข
    if (/\d/.test(password)) score += 1;

    // มีสัญลักษณ์พิเศษ
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // ตั้งค่าคะแนนเต็ม 4 หรือ 100%
    this.passwordStrength = Math.min(score, 4);
  }

  // onPasswordInput(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   this.evaluatePasswordStrength(input.value);
  // }

  onPasswordInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.hasUpper = /[A-Z]/.test(input);
    this.hasLower = /[a-z]/.test(input);
    this.hasNumber = /\d/.test(input);
    this.hasSpecial = /[^A-Za-z0-9]/.test(input);
    this.isLongEnough = input.length >= 8;

    this.evaluatePasswordStrength(input); // ใช้ต่อกับ strength bar
  }
}
