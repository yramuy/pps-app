import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { loginGuard } from './guards/login.guard';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './back-end/components/login/login.component';
import { LayoutComponent } from './back-end/components/layout/layout.component';
import { DashboardComponent } from './back-end/components/dashboard/dashboard.component';
import { EmployeeListComponent } from './back-end/components/employees/employee-list/employee-list.component';
import { EmployeeAddComponent } from './back-end/components/employees/employee-add/employee-add.component';
import { ReportsComponent } from './back-end/components/reports/reports.component';
import { WebsiteLayoutComponent } from './front-end/components/website-layout/website-layout.component';
import { HomeComponent } from './front-end/components/home/home.component';
import { AboutComponent } from './front-end/components/about/about.component';
import { ContactComponent } from './front-end/components/contact/contact.component';
import { CategoryListComponent } from './back-end/components/category/category-list/category-list.component';
import { CategoryAddComponent } from './back-end/components/category/category-add/category-add.component';
import { StatesComponent } from './back-end/components/states/states.component';
import { DistrictsComponent } from './back-end/components/districts/districts.component';
import { AssemblyListComponent } from './back-end/components/assemblies/assembly-list/assembly-list.component';
import { MandalsListComponent } from './back-end/components/mandals/mandals-list/mandals-list.component';
import { VillagesListComponent } from './back-end/components/villages/villages-list/villages-list.component';
import { AssemblyAddComponent } from './back-end/components/assemblies/assembly-add/assembly-add.component';

const routes: Routes = [
  
  // ADMIN LOGIN (NO LAYOUT)
  {
    path: 'admin/login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },

  // Main layout (AFTER login)
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'category/list', component: CategoryListComponent },
      { path: 'category/add', component: CategoryAddComponent },
      { path: 'states/list', component: StatesComponent },
      { path: 'districts/list', component: DistrictsComponent },
      { path: 'assembly/list', component: AssemblyListComponent },
      { path: 'assembly/add', component: AssemblyAddComponent },
      { path: 'mandal/list', component: MandalsListComponent },
      { path: 'village/list', component: VillagesListComponent },
      { path: 'employees/add', component: EmployeeAddComponent },
      { path: 'reports', component: ReportsComponent }
    ],
  },

  // 🌐 WEBSITE
  {
    path: '',
    component: WebsiteLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
    ],
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
