import { CommonModule } from '@angular/common'; // ✅ สำหรับ *ngIf, *ngFor
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { Country } from '../models/country';
import { District } from '../models/district';
import { AddressLocation } from '../models/location';
import { Province } from '../models/province';
import { ResponseApi } from '../models/response';
import { AccountService } from '../services/AccountService';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule, DropdownModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'], // ✅ แก้ตรงนี้
})
export class ProfileComponent implements OnInit {
  account: any;

  picdefault: String = '/home/aueaungoor/Pictures/defaultProfile.jpg';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  // varlible
  isAdmin = false;
  isFormChanged = false;
  LocationForm = false;
  isSuccess = false;

  selectedCountry: any = null;
  selectedProvince: any = null;
  selectedDistrict: any = null;

  // for Object

  accountOriginal: any;

  location: AddressLocation = {
    country: null,
    province: null,
    district: null,
    // idaccount: this.account.data.idaccount,
  };

  country?: Country[] | null;
  province?: Province[] | null;
  district?: District[] | null;

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    this.http
      .get<AccountResponse>(`http://localhost:8080/accounts/${userId}`)
      .subscribe({
        next: (res) => {
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

          // if (
          //   this.account.data.country != null &&
          //   this.account.data.province != null &&
          //   this.account.data.district != null
          // ) {
          //   this.selectedCountry = this.account.data.country;
          //   this.selectedProvince = this.account.data.province;
          //   this.selectedDistrict = this.account.data.district;
          // } else {
          this.getCountry();
          // }
        },
        error: () => alert('ดึงข้อมูลไ่ม่สำเร็จ'),
      });
    if (localStorage.getItem('userRole') === 'admin') {
      this.isAdmin = true;
    }
  }

  getCountry() {
    console.log('[start] getCountry');

    this.accountService.findlocation(this.location).subscribe({
      next: (res: ResponseApi) => {
        this.country = res.data as Country[];

        console.log('[success] getCountry');
        this.country.forEach((country) => {
          console.log(' -', country.name);
        });
      },
      error: (err) => {
        console.error('[error] getCountry', err);
      },
    });

    console.log('[end] getCountry');
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

  LocationModel() {
    console.log('[ก่อนกด] LocationForm =', this.LocationForm);
    this.LocationForm = true;
    console.log('[หลังกด] LocationForm =', this.LocationForm);
  }

  onCountryChange() {
    if (!this.selectedCountry) return;

    this.location.country = this.selectedCountry;
    this.location.province = null;
    this.location.district = null;
    this.province = null;
    this.district = null;

    this.accountService.findlocation(this.location).subscribe({
      next: (res: ResponseApi) => {
        this.province = res.data as Province[];

        console.log('[success] Province');
        this.province.forEach((province) => {
          console.log(' -', province.name);
        });
      },
      error: (err) => {
        console.error('[error] getCountry', err);
      },
    });
  }

  onProvinceChange() {
    if (!this.selectedProvince) return;
    this.location.district = null;

    this.location.province = this.selectedProvince;

    this.accountService.findlocation(this.location).subscribe({
      next: (res: ResponseApi) => {
        this.district = res.data as District[];

        console.log('[success] District');
        this.district.forEach((district) => {
          console.log(' -', district.name);
        });
      },
      error: (err) => {
        console.error('[error] getCountry', err);
      },
    });
  }

  onDistrictChange() {
    if (!this.selectedProvince) return;
    this.location.district = this.selectedDistrict;
  }

  resetLocationFields() {
    this.selectedCountry = null;
    this.selectedProvince = null;
    this.selectedDistrict = null;
    this.location.country = null;
    this.location.province = null;
    this.location.district = null;
  }

  SubmitLocation() {
    this.location.idaccount = this.account.data.idaccount;
    console.log('location', this.location);
    this.accountService.postlocation(this.location).subscribe({
      next: (res: ResponseApi) => {
        console.log('✅ บันทึกสำเร็จ', res);
        this.LocationForm = false; // ปิดฟอร์ม popup ถ้าต้องการ

        if (res.meassage == 'บันทุกข้อมูลเเง้ว') {
          this.isSuccess = true;
        }
      },
      error: (err) => {
        console.error('[error] getCountry', err);
      },
    });
  }

  closePopup() {
    this.isSuccess = false;
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
