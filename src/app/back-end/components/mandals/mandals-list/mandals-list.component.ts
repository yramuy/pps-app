import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-mandals-list',
  templateUrl: './mandals-list.component.html',
  styleUrls: ['./mandals-list.component.scss'],
})
export class MandalsListComponent {
  mandals: any = [];
  message: string = '';
  isMessage: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public loader: LoaderService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadMandals();
  }

  loadMandals() {
    this.loader.show();

    this.apiService.request('GET', '/mandals').subscribe({
      next: (res: any) => {
        this.mandals = res.mandals || [];

        this.loader.hide();

        setTimeout(() => {
          // ✅ Destroy if already exists
          if ($.fn.DataTable.isDataTable('#mandalsTable')) {
            ($('#mandalsTable') as any).DataTable().destroy();
          }

          // ✅ Reinitialize
          ($('#mandalsTable') as any).DataTable({
            dom: 'Bfrtip',
            buttons: ['excel', 'pdf'],
            responsive: true,
          });
        }, 0);
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
        this.loader.hide();
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
}
