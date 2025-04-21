import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ สำหรับ *ngIf, *ngFor

@Component({
  selector: 'app-profile',
  imports: [ FormsModule,   CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {


  account : any;
  picdefault :String = '/home/aueaungoorn/uploads/blank-profile-picture-973460_1280.webp';

  constructor(private http: HttpClient , private router: Router , private route: ActivatedRoute) {}

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    this.http.get<Account>(`http://localhost:8080/accounts/${userId}`).subscribe({
      next: (res) => {
        if(res.pathpicture)
          {
            this.http.get('http://localhost:8080/accounts/base64' , {
              params: {filename: res.pathpicture.toString()},
              responseType:'text'
            }).subscribe(base64 => {
            
              if (this.account) {
                this.account.pathpicture = 'data:image/png;base64,' + base64;
              }

            })
          }
          else{
            this.http.get('http://localhost:8080/accounts/base64' , {
              params: {filename: this.picdefault.toString()},
              responseType:'text'
            }).subscribe(base64 => {
            
              if (this.account) {
                this.account.pathpicture = 'data:image/png;base64,' + base64;

                
              }
              
    
            })
          }
        
        this.account = res
        console.log(res);
      
      },
      error: () => alert('ดึงข้อมูลไ่ม่สำเร็จ')
    });
  }

  
  onFileSelected(event: any) {
    const file = event.target.files[0];
  
    if (file) {
      // ✅ สร้าง FormData เพื่อแนบไฟล์
      const formData = new FormData();
      formData.append('newfile', file); // ต้องตรงกับชื่อใน @RequestParam("newfile")
  
      // ✅ เรียก API เพื่ออัปโหลดรูป
      this.http.put(`http://localhost:8080/accounts/editpic/${this.account.idaccount}`, formData, {
        responseType: 'text' as 'json'
      }).subscribe(
        res => {
          console.log('✅ บันทึกสำเร็จ:', res);
          alert(res);
        },
        error => {
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
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?")) {
      this.http.delete(`http://localhost:8080/accounts/${this.account.idaccount}`, { responseType: 'text' })
        .subscribe({
          next: () => {
            alert("✅ ลบบัญชีสำเร็จ");
            this.router.navigate(['/mainpage']); // กลับไปหน้าหลัก
          },
          error: () => alert("❌ ลบไม่สำเร็จ")
        });
    }
  }
  
  

  updateProfile() {
    this.http.put(`http://localhost:8080/accounts/editaccount/${this.account.idaccount}`, this.account, {
      responseType: 'text' as 'json'  // 👈 บอก Angular ว่ารับเป็น text แต่ยังใช้เป็น json response ได้
    }).subscribe(
      res => {
        console.log('✅ บันทึกสำเร็จ:', res);
        // ถ้าอยากโชว์ข้อความให้ผู้ใช้เห็น
        alert(res);
      },
      error => {
        console.error('❌ ERROR:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
      }
    );
  
    console.log('📤 ส่งข้อมูล:', this.account);
  }
  

  showPassword: boolean = false;

togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}

goToMainPage() {
  this.router.navigate(['/mainpage']);
}

}




interface Account {
  idaccount: number;
  username: string;
  password: string;
  fname: string;
  lname: string;
  description: string;
  gender: string;
  birthday: string;
  pathpicture :String;
}
