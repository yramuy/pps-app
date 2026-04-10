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
    CategoryListComponent
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
