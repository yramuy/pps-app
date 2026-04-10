import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements AfterViewInit {

  totalIssues = 120;
  resolved = 80;
  pending = 40;
  critical = 10;

  issues = [
    { id: 1, title: 'Road Damage', category: 'Infrastructure', region: 'North', status: 'Pending' },
    { id: 2, title: 'Water Problem', category: 'Utilities', region: 'South', status: 'Resolved' },
    { id: 3, title: 'Electricity Issue', category: 'Utilities', region: 'East', status: 'Pending' }
  ];

  ngAfterViewInit() {
    this.loadCharts();
  }

  loadCharts() {

    // 📊 Category Chart
    new Chart('categoryChart', {
      type: 'bar',
      data: {
        labels: ['Infrastructure', 'Utilities', 'Health', 'Education'],
        datasets: [{
          label: 'Issues',
          data: [40, 30, 20, 30]
        }]
      }
    });

    // 📊 Region Chart
    new Chart('regionChart', {
      type: 'pie',
      data: {
        labels: ['North', 'South', 'East', 'West'],
        datasets: [{
          data: [30, 25, 35, 30]
        }]
      }
    });

  }
}