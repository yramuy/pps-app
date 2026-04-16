import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';
import { LayoutComponent } from './back-end/components/layout/layout.component';
import { HeaderComponent } from './back-end/components/header/header.component';
import { SidebarComponent } from './back-end/components/sidebar/sidebar.component';
import { DashboardComponent } from './back-end/components/dashboard/dashboard.component';
import { EmployeeListComponent } from './back-end/components/employees/employee-list/employee-list.component';
import { EmployeeAddComponent } from './back-end/components/employees/employee-add/employee-add.component';
import { ReportsComponent } from './back-end/components/reports/reports.component';
import { LoginComponent } from './back-end/components/login/login.component';
import { WebsiteLayoutComponent } from './front-end/components/website-layout/website-layout.component';
import { WebsiteHeaderComponent } from './front-end/components/website-header/website-header.component';
import { WebsiteFooterComponent } from './front-end/components/website-footer/website-footer.component';
import { HomeComponent } from './front-end/components/home/home.component';
import { AboutComponent } from './front-end/components/about/about.component';
import { ContactComponent } from './front-end/components/contact/contact.component';
import { CategoryAddComponent } from './back-end/components/category/category-add/category-add.component';
import { CategoryListComponent } from './back-end/components/category/category-list/category-list.component';
import { StatesComponent } from './back-end/components/states/states.component';
import { DistrictsComponent } from './back-end/components/districts/districts.component';
import { AssemblyListComponent } from './back-end/components/assemblies/assembly-list/assembly-list.component';
import { AssemblyAddComponent } from './back-end/components/assemblies/assembly-add/assembly-add.component';
import { MandalsAddComponent } from './back-end/components/mandals/mandals-add/mandals-add.component';
import { MandalsListComponent } from './back-end/components/mandals/mandals-list/mandals-list.component';
import { VillagesListComponent } from './back-end/components/villages/villages-list/villages-list.component';
import { VillagesAddComponent } from './back-end/components/villages/villages-add/villages-add.component';
import { UsersListComponent } from './back-end/components/users/users-list/users-list.component';
import { UsersAddComponent } from './back-end/components/users/users-add/users-add.component';
import { UserRolesAddComponent } from './back-end/components/user-roles/user-roles-add/user-roles-add.component';
import { UserRolesListComponent } from './back-end/components/user-roles/user-roles-list/user-roles-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    DashboardComponent,
    EmployeeListComponent,
    EmployeeAddComponent,
    ReportsComponent,
    LoginComponent,
    WebsiteLayoutComponent,
    WebsiteHeaderComponent,
    WebsiteFooterComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    CategoryAddComponent,
    CategoryListComponent,
    StatesComponent,
    DistrictsComponent,
    AssemblyListComponent,
    AssemblyAddComponent,
    MandalsAddComponent,
    MandalsListComponent,
    VillagesListComponent,
    VillagesAddComponent,
    UsersListComponent,
    UsersAddComponent,
    UserRolesAddComponent,
    UserRolesListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
