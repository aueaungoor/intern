import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-zipfile',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './zipfile.component.html',
  styleUrl: './zipfile.component.css',
})
export class ZipfileComponent {
  sourceFolder: string = '';
  zipName: string = '';

  constructor(private http: HttpClient, private router: Router) {}
  onFolderSelect(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const folderName = files[0].webkitRelativePath.split('/')[0];
      this.sourceFolder = `/home/aueaungoor/${folderName}`;
      console.log('📂 ได้โฟลเดอร์:', this.sourceFolder);
    }
  }

  submitZip() {
    if (!this.sourceFolder || !this.zipName) {
      alert('กรุณาเลือกโฟลเดอร์และชื่อ ZIP');
      return;
    }

    const url = `http://localhost:8080/accounts/download?sourceFolder=${encodeURIComponent(
      this.sourceFolder
    )}&zipName=${encodeURIComponent(this.zipName)}`;
    window.open(url, '_blank');
  }

  goToMainPage() {
    this.router.navigate(['/mainpage']);
  }
}
