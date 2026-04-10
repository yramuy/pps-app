import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss']
})
export class EmployeeAddComponent {

  employee: any = {
    name: '',
    email: '',
    phone: '',
    position: ''
  };

  constructor(private router: Router) {}

  submitForm() {
    console.log('Employee Data:', this.employee);

    // 👉 API call here (later)
    // this.http.post('api/employees', this.employee)

    alert('Employee Added Successfully!');

    this.router.navigate(['/employees/list']);
  }

  resetForm() {
    this.employee = {
      name: '',
      email: '',
      phone: '',
      position: ''
    };
  }
  
}
