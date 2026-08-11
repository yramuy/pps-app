import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-view-schemes',
  templateUrl: './view-schemes.component.html',
  styleUrls: ['./view-schemes.component.scss']
})
export class ViewSchemesComponent {

  // 🔹 Signals (state)
    mySchemes = signal<any[]>([]);
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
      // ✅ Subscribe once → trigger API
      // this.authService.user$.subscribe((user) => {
      //   this.loginUser.set(user);
  
      //   if (user) {
      //     this.loadSchemes(user); // ✅ only once per user
      //   }
      // });

      this.loadSchemes(); 

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
  
    // 🔥 API call
    loadSchemes() {
      // this.loading.set(true);
      this.loader.show();
  
  
      this.apiService.request('GET', '/allSchemes').subscribe({
        next: (res: any) => {
          this.mySchemes.set(res.all_schemes || []);
          console.log('mySchemes : ', this.mySchemes()); // ✅ correct place
          // this.loading.set(false);
          this.loader.hide();
  
          setTimeout(() => {
            if (this.mySchemes().length > 0) {
              if ($.fn.DataTable.isDataTable('#mySchemesTable')) {
                ($('#mySchemesTable') as any).DataTable().destroy();
              }
  
              ($('#mySchemesTable') as any).DataTable({
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
  
    handleEdit(schemeObj: any) {
      this.router.navigate(['/admin/schemes/add'], {
        state: {
          scheme: schemeObj,
          isEdit: true,
        },
      });
    }
  
    confirmDelete(id: string) {
      if (confirm('Are you sure you want to delete this record?')) {
        this.deleteScheme(id);
      }
    }
  
    handleView(id: any) {
  
      this.router.navigate(['/admin/schemes/view-scheme'], {
        state: {
          schemeID: id
        },
      });
      
    }
  
    deleteScheme(id: string) {
      const payload = JSON.stringify({
        id: id,
        master_id: '10',
      });
  
      this.apiService.request('POST', '/deleteRecord', payload).subscribe({
        next: (res: any) => {
          this.showMessage(res.message);
  
          // ✅ Update signal correctly
          this.mySchemes.update((schemes) =>
            schemes.filter((c: any) => c.id !== id),
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
      if ($.fn.DataTable.isDataTable('#mySchemesTable')) {
        ($('#mySchemesTable') as any).DataTable().destroy();
      }
  
      // ✅ Wait for Angular DOM update
      setTimeout(() => {
        ($('#mySchemesTable') as any).DataTable({
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
