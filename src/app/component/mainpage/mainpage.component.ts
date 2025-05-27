import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-mainpage',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    FormsModule, // ✅ สำหรับ routerLink และ Router
  ],
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css'],
})
export class MainpageComponent implements OnInit {
  accountsearch: Account = {
    idaccount: 1,
    username: '',
    password: '',
    fname: '',
    lname: '',
    description: '',
    gender: '',
    birthday: '',
    pathpicture: '',
  };

  // For Varable
  loginSuccess = false;
  loginFailed = false;
  isLoggedIn: boolean = false;
  Accountlist: Account[] = [];
  paginatedAccounts: Account[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  modalPage: number = 0;

  showModal: boolean = false;
  modalType: 'sport' | 'career' = 'sport';
  modalData: { id: number; name: string }[] = [];

  index: number = 1;
  modelcareer: CareerItem[] = [];

  modelsport: SportItem[] = [];
  selectedToAdd: string[] = [];
  selectedAccount: Account | null = null;

  showEditModal: boolean = false;
  editAccount: Account | null = null;

  showDeleteModal: boolean = false;
  accountIdToDelete: number | null = null;

  allSports = [
    'Football',
    'Basketball',
    'Volleyball',
    'Tennis',
    'Badminton',
    'Table Tennis',
    'Running',
    'Swimming',
    'Cycling',
  ];
  allCareers = [
    'Developer',
    'Designer',
    'Project Manager',
    'Teacher',
    'Doctor',
    'Engineer',
    'Architect',
    'Lawyer',
    'Data Scientist',
  ];

  prefixpath: String = '/home/aueaungoorn/uploads/';

  selectedFile: File | null = null;

  paging: pagingRespon = {
    account: [],
    index: 1,
    limit: 5,
    total: 0,
    status: '',
  };

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    this.loadAccountspadding();
  }

  loadAccountspadding(): void {
    this.http
      .post<PagingResponse>(
        'http://localhost:8080/accounts/accountpaging',
        this.paging
      )
      .subscribe({
        next: (res) => {
          this.Accountlist = res.data.account ?? [];
          this.paging.total = res.data.total;
          this.totalPages = Math.ceil(this.paging.total / this.paging.limit);

          console.log('✅ Loaded page:', this.paging.index);
        },
        error: (err) => {
          console.error('❌ Error loading paged accounts:', err);
          this.Accountlist = [];
        },
      });
  }

  nextPage(): void {
    if (this.paging.index < this.totalPages) {
      this.paging.index++;
      this.loadAccountspadding();
    }
  }

  previousPage(): void {
    if (this.paging.index > 1) {
      this.paging.index--;
      this.loadAccountspadding();
    }
  }

  getSport(account: Account): void {
    this.selectedAccount = account;
    this.http
      .post<SportResponse>('http://localhost:8080/accounts/getSport', account)
      .subscribe({
        next: (res) => {
          console.log('sport', res);
          this.modalType = 'sport';
          this.modalData = res.data.map((item) => ({
            name: item.sportname,
            id: item.idaccountSport,
          }));
          this.showModal = true;
        },
        error: () => alert('ไม่สามารถดึงข้อมูล sport ได้'),
      });
  }

  getCareer(account: Account): void {
    this.selectedAccount = account;
    this.http
      .post<CareerResponse>('http://localhost:8080/accounts/getCareer', account)
      .subscribe({
        next: (res) => {
          this.modalType = 'career';
          this.modalData = res.data.map((item) => ({
            name: item.careername,
            id: item.idaccountCareer,
          }));
          this.showModal = true;
        },
        error: () => alert('ไม่สามารถดึงข้อมูล career ได้'),
      });
  }

  hasItem(name: string): boolean {
    return this.modalData.some((item) => item.name === name);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedToAdd = [];
    this.selectedAccount = null;
  }

  deleteItem(item: any, type?: 'sport' | 'career', id?: number): void {
    console.log(`ลบ ${type} :`, item);
    console.log('id {}', id);

    if (this.modalType === 'career') {
      this.http
        .delete(`http://localhost:8080/accounts/deleteCareer/${id}`, {
          responseType: 'text',
        })
        .subscribe({
          next: (res) => {
            console.log('✅ :', res); // <<-- res คือข้อความ string จาก backend
            alert(res); // แสดงข้อความที่ backend ส่งกลับ
            this.modalData = this.modalData.filter((i) => i.id !== id); // ลบจากหน้า UI
          },
          error: (err) => {
            console.error('❌ ลบไม่สำเร็จ:', err);
            alert('ลบไม่สำเร็จ');
          },
        });
    } else {
      this.http
        .delete(`http://localhost:8080/accounts/deleteSport/${id}`, {
          responseType: 'text',
        })
        .subscribe({
          next: (res) => {
            console.log('✅ :', res); // <<-- res คือข้อความ string จาก backend
            alert(res); // แสดงข้อความที่ backend ส่งกลับ
            this.modalData = this.modalData.filter((i) => i.id !== id); // ลบจากหน้า UI
          },
          error: (err) => {
            console.error('❌ ลบไม่สำเร็จ:', err);
            alert('ลบไม่สำเร็จ');
          },
        });
    }

    this.modalData = this.modalData.filter((i) => i !== item);
  }

  onSelectToAdd(item: string, type: 'sport' | 'career', event: any): void {
    if (event.target.checked) {
      this.selectedToAdd.push(item);
    } else {
      this.selectedToAdd = this.selectedToAdd.filter((i) => i !== item);
    }
  }

  submitAddSelected(type: 'sport' | 'career'): void {
    if (!this.selectedAccount) return;

    const requests = this.selectedToAdd.map((name) => {
      const body =
        this.modalType === 'sport'
          ? { sportname: name, account: this.selectedAccount }
          : { careername: name, account: this.selectedAccount };
      const url = `http://localhost:8080/accounts/add${
        this.modalType.charAt(0).toUpperCase() + this.modalType.slice(1)
      }`;
      return this.http.post(url, body).toPromise();
    });

    Promise.all(requests)
      .then(() => {
        alert(
          `เพิ่ม${this.modalType === 'sport' ? 'กีฬา' : 'อาชีพ'}ทั้งหมดสำเร็จ`
        );
        this.closeModal();
        this.loadAccountspadding();
      })
      .catch((err) => {
        console.error('❌ เพิ่มไม่สำเร็จ:', err);
      });
  }

  formeditaccount(idaccount: number): void {
    this.http
      .get<Account>(`http://localhost:8080/accounts/${idaccount}`)
      .subscribe({
        next: (res) => {
          this.editAccount = res;
          this.showEditModal = true;

          if (res.pathpicture) {
            this.http
              .get('http://localhost:8080/accounts/base64', {
                params: { filename: res.pathpicture.toString() },
                responseType: 'text',
              })
              .subscribe((base64) => {
                if (this.editAccount) {
                  this.editAccount.pathpicture =
                    'data:image/png;base64,' + base64;
                }
              });
          }
        },
      });
  }

  submitEdit(): void {
    if (!this.editAccount) return;

    const id = this.editAccount.idaccount;

    this.http
      .put(
        `http://localhost:8080/editaccount/editaccount/${id}`,
        this.editAccount
      )
      .subscribe({
        next: () => {
          alert('✅ แก้ไขข้อมูลสำเร็จ');
          this.closeEditModal();
          this.loadAccountspadding();
        },
        error: () => alert('❌ แก้ไขไม่สำเร็จ'),
      });
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  confirmDelete(id: number): void {
    this.accountIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.accountIdToDelete = null;
    this.showDeleteModal = false;
  }

  deleteAccount(): void {
    if (!this.accountIdToDelete) return;
    this.http
      .delete(`http://localhost:8080/accounts/${this.accountIdToDelete}`, {
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          alert('ลบสำเร็จ');
          this.cancelDelete();
          this.loadAccountspadding();
        },
        error: () => alert('ลบไม่สำเร็จ'),
      });
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.isLoggedIn = false;
    window.location.href = '/login';
  }

  hasNotItem(name: string): boolean {
    return !this.modalData.some((i) => i.name === name);
  }

  viewProfile(id: number) {
    this.router.navigate(['/profile', id]); // ต้อง import Router และ inject ใน constructor
  }

  goToZipfilePage() {
    this.router.navigate(['/zipfile']);
  }

  searchKeyword: string = '';

  searchAccounts(): void {
    const keyword = this.searchKeyword.trim();

    if (!keyword) {
      this.loadAccountspadding(); // ถ้าไม่มีคำค้น → โหลดทั้งหมด
      return;
    }

    if (this.accountsearch) {
      this.accountsearch.username = keyword;
    }

    this.http
      .post<AccountResponse>(
        `http://localhost:8080/accounts/search`,
        this.accountsearch
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.Accountlist = res.data ?? [];

          this.paging.index = 1;
          this.totalPages = 1;
          console.log(this.Accountlist);
        },
        error: (err) => {
          console.error('❌ ค้นหาไม่สำเร็จ:', err);
          this.Accountlist = [];
        },
      });
  }

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ผู้ใช้งาน');

    // กำหนดคอลัมน์ (ใส่ชื่อ header และ key ตาม field ที่มีใน this.Accountlist)
    worksheet.columns = [
      { header: 'ID', key: 'idaccount', width: 10 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Password', key: 'password', width: 20 },
      { header: 'ชื่อ', key: 'fname', width: 15 },
      { header: 'นามสกุล', key: 'lname', width: 15 },
      { header: 'คำอธิบาย', key: 'description', width: 30 },
      { header: 'เพศ', key: 'gender', width: 10 },
      { header: 'วันเกิด', key: 'birthday', width: 15 },
      // เพิ่ม field อื่น ๆ ได้ตามต้องการ
    ];

    // เพิ่มข้อมูลจาก this.Accountlist ลง worksheet
    worksheet.addRows(this.Accountlist);

    // สร้างไฟล์ .xlsx และดาวน์โหลด
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(
        blob,
        'รายชื่อผู้ใช้งาน_' + new Date().getTime() + '.xlsx'
      );
    });
  }

  exportToCSV(): void {
    const csvData = this.convertToCSV(this.Accountlist);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(blob, 'SearchResults_' + new Date().getTime() + '.csv');
  }

  convertToCSV(objArray: any[]): string {
    const array =
      typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';

    for (const row of array) {
      const line = headers.map((header) => `"${row[header]}"`).join(',');
      str += line + '\r\n';
    }
    return str;
  }

  closeAlert() {
    this.loginSuccess = false;
    this.loginFailed = false;
  }
}

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

interface Account {
  idaccount: number;
  username: string;
  password: string;
  fname: string;
  lname: string;
  description: string;
  gender: string;
  birthday: string;
  pathpicture: String;
}

interface SportItem {
  idaccountSport: number;
  sportname: string;
  account: Account;
}

interface CareerItem {
  idaccountCareer: number;
  careername: string;
  account: Account;
}

interface SportResponse {
  data: SportItem[];
  status: string;
}

interface CareerResponse {
  data: CareerItem[];
  status: string;
}

interface pagingRespon {
  account: Account[];
  index: number;
  limit: 5;
  total: number;
  status: String;
}

interface PagingResponse {
  data: {
    account: Account[];
    total: number;
  };
  status: string;
}

interface AccountResponse {
  data: Account[];
  status: String;
}
