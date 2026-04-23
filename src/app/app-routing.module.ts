import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { loginGuard } from './guards/login.guard';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './back-end/components/login/login.component';
import { LayoutComponent } from './back-end/components/layout/layout.component';
import { DashboardComponent } from './back-end/components/dashboard/dashboard.component';
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
import { MandalsAddComponent } from './back-end/components/mandals/mandals-add/mandals-add.component';
import { VillagesAddComponent } from './back-end/components/villages/villages-add/villages-add.component';
import { UsersListComponent } from './back-end/components/users/users-list/users-list.component';
import { UsersAddComponent } from './back-end/components/users/users-add/users-add.component';
import { UserRolesListComponent } from './back-end/components/user-roles/user-roles-list/user-roles-list.component';
import { UserRolesAddComponent } from './back-end/components/user-roles/user-roles-add/user-roles-add.component';
import { IssuesListComponent } from './back-end/components/issues/issues-list/issues-list.component';
import { IssueCreateComponent } from './back-end/components/issues/issue-create/issue-create.component';
import { MyIssuesComponent } from './back-end/components/issues/my-issues/my-issues.component';
import { AssignedToMeIssuesComponent } from './back-end/components/issues/assigned-to-me-issues/assigned-to-me-issues.component';

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
      { path: 'mandal/add', component: MandalsAddComponent },
      { path: 'village/list', component: VillagesListComponent },
      { path: 'village/add', component: VillagesAddComponent },
      { path: 'users/list', component: UsersListComponent },
      { path: 'users/add', component: UsersAddComponent },
      { path: 'userRole/list', component: UserRolesListComponent },
      { path: 'userRole/add', component: UserRolesAddComponent },

      { path: 'issues/list', component: IssuesListComponent },
      { path: 'issues/create', component: IssueCreateComponent },
      { path: 'issues/my-issues', component: MyIssuesComponent },
      { path: 'issues/assigned-to-me-issues', component: AssignedToMeIssuesComponent },

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
