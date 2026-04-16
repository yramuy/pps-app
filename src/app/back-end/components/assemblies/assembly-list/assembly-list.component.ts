import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-assembly-list',
  templateUrl: './assembly-list.component.html',
  styleUrls: ['./assembly-list.component.scss'],
})
export class AssemblyListComponent {
  assemblies: any = [];
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

    this.loadAssemblies();
  }

  handleAdd() {
    this.router.navigate(['/admin/assembly/add']);
  }

  handleEdit(assemObj: any) {
    this.router.navigate(['/admin/assembly/add'], {
      state: {
        assembly: assemObj,
        isEdit: true,
      },
    });
  }

  confirmDelete(id: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.deleteCategory(id);
    }
  }

  deleteCategory(id: string) {
    const payload = JSON.stringify({
      id: id,
      master_id: '1',
    });

    this.apiService.request('POST', '/deleteRecord', payload).subscribe({
      next: (res: any) => {
        this.showMessage(res.message);

        // ✅ Remove from array
        this.assemblies = this.assemblies.filter((c: any) => c.id !== id);

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
    if ($.fn.DataTable.isDataTable('#assembliesTable')) {
      ($('#assembliesTable') as any).DataTable().destroy();
    }

    // ✅ Wait for Angular DOM update
    setTimeout(() => {
      ($('#assembliesTable') as any).DataTable({
        dom: 'Bfrtip',
        buttons: ['excel', 'pdf'],
        responsive: true,
      });
    }, 100);
  }

  loadAssemblies() {
    this.loader.show();

    this.apiService.request('GET', '/assemblies').subscribe({
      next: (res: any) => {
        this.assemblies = res.assemblies || [];

        this.loader.hide();

        setTimeout(() => {
          // ✅ Destroy if already exists
          if ($.fn.DataTable.isDataTable('#assembliesTable')) {
            ($('#assembliesTable') as any).DataTable().destroy();
          }

          // ✅ Reinitialize
          ($('#assembliesTable') as any).DataTable({
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
