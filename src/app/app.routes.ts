import { RegisterComponent } from './component/auth/register/register.component';

import { LoginComponent } from './component/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainpageComponent } from './component/mainpage/mainpage.component';
import { roleGuard } from './guards/role.guard';
import { ProfileComponent } from './profile/profile.component';
import { ZipfileComponent } from './zipfile/zipfile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'zipfile', component: ZipfileComponent },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'mainpage',
    component: MainpageComponent,
    canActivate: [AuthGuard, roleGuard],
    data: { expectedRole: 'admin' }, // 🛡 เช็กว่าเป็น admin
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
