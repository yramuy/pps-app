import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent {
  categories: any = [];
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

    this.loadCategories();
  }

  loadCategories() {
    this.loader.show();

    const payload = JSON.stringify({
      master_id: '1',
    });

    this.apiService.request('POST', '/masterData', payload).subscribe({
      next: (res: any) => {
        this.categories = res.master_data || [];

        this.loader.hide();

        setTimeout(() => {
          // ✅ Destroy if already exists
          if ($.fn.DataTable.isDataTable('#categoryTable')) {
            ($('#categoryTable') as any).DataTable().destroy();
          }

          // ✅ Reinitialize
          ($('#categoryTable') as any).DataTable({
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
    this.router.navigate(['/admin/category/add']);
  }

  handleEdit(cat: any) {
    this.router.navigate(['/admin/category/add'], {
      state: {
        category: cat,
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
        this.categories = this.categories.filter((c: any) => c.id !== id);

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
    if ($.fn.DataTable.isDataTable('#categoryTable')) {
      ($('#categoryTable') as any).DataTable().destroy();
    }

    // ✅ Wait for Angular DOM update
    setTimeout(() => {
      ($('#categoryTable') as any).DataTable({
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
