import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-villages-list',
  templateUrl: './villages-list.component.html',
  styleUrls: ['./villages-list.component.scss'],
})
export class VillagesListComponent {
  villages: any = [];
  message: string = '';
  isMessage: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public loader: LoaderService,
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
    this.loadVillages();
  }

  loadVillages() {
    this.loader.show();

    this.apiService.request('GET', '/villages').subscribe({
      next: (res: any) => {
        this.villages = res.villages || [];

        this.loader.hide();

        setTimeout(() => {
          // ✅ Destroy if already exists
          if ($.fn.DataTable.isDataTable('#villagesTable')) {
            ($('#villagesTable') as any).DataTable().destroy();
          }

          // ✅ Reinitialize
          ($('#villagesTable') as any).DataTable({
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

  handleAdd() {
    this.router.navigate(['/admin/village/add']);
  }

  handleEdit(villageObj: any) {
    this.router.navigate(['/admin/village/add'], {
      state: {
        village: villageObj,
        isEdit: true,
      },
    });
  }

  confirmDelete(id: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.deleteRecord(id);
    }
  }

  deleteRecord(id: string) {
    const payload = JSON.stringify({
      id: id,
      master_id: '6',
    });

    this.apiService.request('POST', '/deleteRecord', payload).subscribe({
      next: (res: any) => {
        this.showMessage(res.message);

        // ✅ Remove from array
        this.villages = this.villages.filter((c: any) => c.id !== id);

        // ✅ Reload DataTable properly
        this.reloadDataTable();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  reloadDataTable() {
    // ✅ Destroy first
    if ($.fn.DataTable.isDataTable('#villagesTable')) {
      ($('#villagesTable') as any).DataTable().destroy();
    }

    // ✅ Wait for Angular DOM update
    setTimeout(() => {
      ($('#villagesTable') as any).DataTable({
        dom: 'Bfrtip',
        buttons: ['excel', 'pdf'],
        responsive: true,
      });
    }, 100);
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
