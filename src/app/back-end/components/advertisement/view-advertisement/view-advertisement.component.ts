import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-view-advertisement',
  templateUrl: './view-advertisement.component.html',
  styleUrls: ['./view-advertisement.component.scss']
})
export class ViewAdvertisementComponent {

  // Signals (state)

  myAdvertisements = signal<any[]>([]);
  loginUser = signal<any>(null);
  loading = signal(false);
  message = signal('');
  isMessage: boolean = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public loader: LoaderService,
    private router: Router,
  ) {

    this.loadAdvertisements();

  }

  ngOnInit() {
    const state = history.state;

    if (state.message) {
      this.message.set(state.message);
      this.isMessage = true;

      // Clear History
      history.replaceState({}, '');

      setTimeout(() => {
        this.isMessage = false;
      }, 3000);
    }
  }

  // API call
  loadAdvertisements() {
    // this.loading.set(true);
    this.loader.show();


    let payload = {
      mode: 1
    };

    this.apiService.request('POST', '/allAdvertisements', payload).subscribe({
      next: (res: any) => {
        this.myAdvertisements.set(res.advertisements || []);
        console.log('myAdvertisements : ', this.myAdvertisements()); // ✅ correct place
        // this.loading.set(false);
        this.loader.hide();

        setTimeout(() => {
          if (this.myAdvertisements().length > 0) {
            if ($.fn.DataTable.isDataTable('#myAdvertisementsTable')) {
              ($('#myAdvertisementsTable') as any).DataTable().destroy();
            }

            ($('#myAdvertisementsTable') as any).DataTable({
              dom: 'Bfrtip',
              buttons: ['excel', 'pdf'],
              responsive: true,
            });
          }
        }, 0);
      },

      error: (err: any) => {
        if (err.status === 401) {
          this.message.set('Token expired');
          this.authService.logout();
        } else if (err.status === 400) {
          this.message.set('Invalid request data');
        } else if (err.status === 500) {
          this.message.set('Server error. Please try again later');
        } else {
          this.message.set('Something went wrong. Please try again later');
        }

        // this.loading.set(false);
        this.loader.hide();
      },
    });
  }

  handleEdit(advertisementObj: any) {
    this.router.navigate(['/admin/advertisement/add'], {
      state: {
        advertisement: advertisementObj,
        isEdit: true,
      },
    });
  }

  confirmDelete(id: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.deleteAdvertisement(id);
    }
  }

  handleView(id: any) {

    this.router.navigate(['/admin/advertisement/view-advertisement'], {
      state: {
        advertisementID: id
      },
    });

  }

  deleteAdvertisement(id: string) {

    const payload = JSON.stringify({
      id: id,
      master_id: '15',
    });

    this.apiService.request('POST', '/deleteRecord', payload).subscribe({
      next: (res: any) => {
        this.showMessage(res.message);

        // ✅ Update signal correctly
        this.myAdvertisements.update((advertisements) =>
          advertisements.filter((c: any) => c.id !== id),
        );

        // ✅ Reload DataTable
        this.reloadDataTable();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  reloadDataTable() {
    
    // ✅ Destroy first
    if ($.fn.DataTable.isDataTable('#myAdvertisementsTable')) {
      ($('#myAdvertisementsTable') as any).DataTable().destroy();
    }

    // ✅ Wait for Angular DOM update
    setTimeout(() => {
      ($('#myAdvertisementsTable') as any).DataTable({
        dom: 'Bfrtip',
        buttons: ['excel', 'pdf'],
        responsive: true,
      });
    }, 100);

  }

  showMessage(msg: string) {
    this.message.set(msg);
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }

}
