import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
declare var $: any;

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  message: string = '';
  isMessage: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const state = history.state;

    if (state.message) {
      this.message = state.message;
      this.isMessage = true;

      // Clear History
      history.replaceState({}, '');

      setTimeout(() => {
        this.isMessage = false;
      }, 3000);
    }

    this.loadEmployees();
  }

  loadEmployees(): void {
    this.apiService.request('GET', '/employees').subscribe({
      next: (res: any) => {
        this.employees = res.employees || [];

        // setTimeout(() => {
        //   this.initializeDataTable();
        // }, 0);

        console.log('Employees:', this.employees);
      },

      error: (err) => {
        if (err.status === 401) {
          this.showMessage('Token expired');
          this.authService.setLoginStatus(false);
        } else if (err.status === 400) {
          this.showMessage('Invalid request data');
        } else if (err.status === 500) {
          this.showMessage('Server error. Please try again later');
        } else {
          this.showMessage('Something went wrong. Please try again later');
        }

        console.error('Failed to load employees', err);
      },
    });
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }

  ngAfterViewInit() {
    ($('#employeeTable') as any).DataTable({
      dom: 'Bfrtip',
      buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
      responsive: true,
    });
  }
}
