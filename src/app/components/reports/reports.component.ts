import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  reports = [
    { id: 1, name: 'Ramu', department: 'IT', status: 'Active' },
    { id: 2, name: 'Kumar', department: 'HR', status: 'Leave' },
    { id: 3, name: 'Suresh', department: 'Finance', status: 'Inactive' }
  ];

}
