import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    RouterModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
  
  ) {
    
    this.maxDate = this.getToday(); // ✅ move here
    this.registerForm = this.fb.group({
      username: ['',[Validators.required]],
      password: ['', [Validators.required, this.passwordValidator]],
      fname: ['',[Validators.required]],
      lname: ['',[Validators.required]],
      description: ['',[Validators.required]],
      gender:['',[Validators.required]],
      birthday:['',[Validators.required]],
    });
  }

  maxDate : String;
previewImage: string | null = null;
selectedFile: File | null = null;

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(this.selectedFile);
  }
}



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
    const accountBlob = new Blob(
      [JSON.stringify(account)],
      { type: 'application/json' }
    );
    formData.append('account', accountBlob);

    // 👇 แนบไฟล์รูปภาพ
    formData.append('file', this.selectedFile);

    console.log("fromdata -> {}",formData);

    // 👇 ส่ง multipart ไป backend
    this.http.post('http://localhost:8080/accounts', formData , { responseType: 'text'}).subscribe({

      next: (res) => {
        console.log('✅ Register success:', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('❌ Register failed:', err);
      }
    });
  } else {
    console.warn('⚠️ Form is not valid or no file selected');
  }
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

  const isValid = hasUpper && hasLower && hasNumber && hasSpecial && isValidLength;

  return isValid ? null : { passwordStrength: true };
}


}

interface Account {
  idaccount?: number; // ทำให้ optional เพราะตอนสมัครใหม่ยังไม่มี
  username: string;
  password: string;
  fname: string;
  lname: string;
  description: string;
  gender: string;
  birthday: string; // เช่น "1995-01-15"
}
