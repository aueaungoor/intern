import { CommonModule } from '@angular/common'; // ✅ สำหรับ *ngIf, *ngFor
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account } from '../models/account';
import { Country } from '../models/country';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  account: any;

  picdefault: String = '/home/aueaungoor/Pictures/defaultProfile.jpg';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // varlible
  isAdmin = false;
  isFormChanged = false;

  // for Object
  accountEdit: Account = {
    username: '',
    password: '',
    fname: '',
    lname: '',
    gender: '',
    description: '',
  };
  accountOriginal: any;

  country: Country = {};

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    this.http
      .get<AccountResponse>(`http://localhost:8080/accounts/${userId}`)
      .subscribe({
        next: (res) => {
          console.log('account', res);
          this.account = res;
          this.accountOriginal = JSON.parse(JSON.stringify(res.data));
          if (res.data.pathpicture) {
            this.http
              .get('http://localhost:8080/accounts/base64', {
                params: { filename: res.data.pathpicture.toString() },
                responseType: 'text',
              })
              .subscribe((base64) => {
                if (this.account) {
                  this.account.data.pathpicture =
                    'data:image/png;base64,' + base64;
                }
              });
          } else {
            this.http
              .get('http://localhost:8080/accounts/base64', {
                params: { filename: this.picdefault.toString() },
                responseType: 'text',
              })
              .subscribe((base64) => {
                if (this.account) {
                  this.account.data.pathpicture =
                    'data:image/png;base64,' + base64;
                }
              });
          }
          console.log('account -> {}', this.account);
        },
        error: () => alert('ดึงข้อมูลไ่ม่สำเร็จ'),
      });
    if (localStorage.getItem('userRole') === 'admin') {
      this.isAdmin = true;
    }

    this.getCountry();
  }

  getCountry() {
    // this.country = AccountService.getCountry();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      // ✅ สร้าง FormData เพื่อแนบไฟล์
      const formData = new FormData();
      formData.append('newfile', file); // ต้องตรงกับชื่อใน @RequestParam("newfile")

      // ✅ เรียก API เพื่ออัปโหลดรูป
      this.http
        .put(
          `http://localhost:8080/accounts/editpic/${this.account.data.idaccount}`,
          formData,
          {
            responseType: 'text' as 'json',
          }
        )
        .subscribe(
          (res) => {
            console.log('✅ บันทึกสำเร็จ:', res);
            alert(res);
          },
          (error) => {
            console.error('❌ ERROR:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
          }
        );

      // ✅ แสดง preview รูปทันที
      const reader = new FileReader();
      reader.onload = () => {
        if (this.account) {
          this.account.pathpicture = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  deleteAccount(): void {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?')) {
      this.http
        .delete(
          `http://localhost:8080/accounts/${this.account.data.idaccount}`,
          { responseType: 'text' }
        )
        .subscribe({
          next: () => {
            alert('✅ ลบบัญชีสำเร็จ');
            this.router.navigate(['/mainpage']); // กลับไปหน้าหลัก
          },
          error: () => alert('❌ ลบไม่สำเร็จ'),
        });
    }
  }

  updateProfile() {
    this.http
      .put(
        `http://localhost:8080/accounts/editaccount/${this.account.data.idaccount}`,
        this.account.data,
        {
          responseType: 'text' as 'json', // 👈 บอก Angular ว่ารับเป็น text แต่ยังใช้เป็น json response ได้
        }
      )
      .subscribe(
        (res) => {
          console.log('✅ บันทึกสำเร็จ:', res);
          // ถ้าอยากโชว์ข้อความให้ผู้ใช้เห็น
          this.accountOriginal = JSON.parse(JSON.stringify(this.account.data));

          alert(res);
        },
        (error) => {
          console.error('❌ ERROR:', error);
          alert('เกิดข้อผิดพลาด: ' + error.message);
        }
      );

    console.log('📤 ส่งข้อมูล:', this.account);

    this.isFormChanged = false;
  }

  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToMainPage() {
    if (1) {
      this.router.navigate(['/mainpage']);
    }
  }

  onInputChange() {
    console.log('origin = ', this.accountOriginal);
    console.log('new = ', this.account.data);

    const cleanCurrent = { ...this.account.data };
    const cleanOriginal = { ...this.accountOriginal };

    // ลบ property รูปภาพที่ไม่ต้องการเช็คออก
    delete cleanCurrent.pathpicture;
    delete cleanOriginal.pathpicture;

    // (ถ้ามี field อื่นที่อยากละเว้นก็นำมาลบที่นี่ได้อีก)

    this.isFormChanged =
      JSON.stringify(cleanCurrent) !== JSON.stringify(cleanOriginal);

    console.log('isFormChanged:', this.isFormChanged);
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/login';
  }
}
interface AccountResponse {
  data: {
    idaccount: number;
    username: string;
    password: string;
    fname: string;
    lname: string;
    description: string;
    gender: string;
    birthday: string;
    pathpicture: String;
  };
  message: String;
}
