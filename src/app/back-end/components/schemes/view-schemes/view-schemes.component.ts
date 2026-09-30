import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

declare var $: any;

@Component({
  selector: 'app-view-schemes',
  templateUrl: './view-schemes.component.html',
  styleUrls: ['./view-schemes.component.scss']
})
export class ViewSchemesComponent {

  // ============================================================
  // DATA
  // ============================================================

  mySchemes = signal<any[]>([]);

  loginUser = signal<any>(null);

  loading = signal(false);

  message = signal('');

  isMessage: boolean = false;

  // ============================================================
  // FILTERS
  // ============================================================

  postDate: string = '';

  schemeType: string = '';

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public loader: LoaderService,
    private router: Router
  ) {
    this.loadSchemes();
  }

  // ============================================================
  // NG ON INIT
  // ============================================================

  ngOnInit(): void {

    const state = history.state;

    if (state && state.message) {

      this.message.set(state.message);

      this.isMessage = true;

      history.replaceState({}, '');

      setTimeout(() => {
        this.isMessage = false;
      }, 3000);
    }
  }

  // ============================================================
  // LOAD SCHEMES
  // ============================================================

  loadSchemes(): void {

    console.log('=================================');
    console.log('Loading schemes...');
    console.log('Post Date:', this.postDate);
    console.log('Scheme Type:', this.schemeType);
    console.log('=================================');

    this.loader.show();

    // ------------------------------------------------------------
    // Destroy existing DataTable first
    // ------------------------------------------------------------

    this.destroyDataTable();

    // ------------------------------------------------------------
    // POST PAYLOAD
    // ------------------------------------------------------------

    const payload = JSON.stringify({
      mode: 'web',
      post_date: this.postDate || '',
      scheme_type: this.schemeType || ''
    });

    console.log(
      'allSchemes payload:',
      payload
    );

    // ------------------------------------------------------------
    // API CALL
    // ------------------------------------------------------------

    this.apiService
      .request(
        'POST',
        '/allSchemes',
        payload
      )
      .subscribe({

        // ========================================================
        // SUCCESS
        // ========================================================

        next: (res: any) => {

          console.log(
            'allSchemes response:',
            res
          );

          // ------------------------------------------------------
          // API RESPONSE KEY IS scheme_list
          // ------------------------------------------------------

          const schemes =
            res &&
            Array.isArray(res.scheme_list)
              ? res.scheme_list
              : [];

          console.log(
            'Filtered schemes:',
            schemes
          );

          // ------------------------------------------------------
          // Update Angular signal
          // ------------------------------------------------------

          this.mySchemes.set(
            schemes
          );

          console.log(
            'mySchemes after set:',
            this.mySchemes()
          );

          this.loader.hide();

          // ------------------------------------------------------
          // Wait for Angular to render the new rows
          // ------------------------------------------------------

          setTimeout(() => {

            this.initializeDataTable();

          }, 100);

        },

        // ========================================================
        // ERROR
        // ========================================================

        error: (err: any) => {

          console.error(
            'allSchemes API error:',
            err
          );

          this.loader.hide();

          // Clear list when API fails
          this.mySchemes.set([]);

          if (err.status === 401) {

            this.message.set(
              'Token expired'
            );

            this.isMessage = true;

            this.authService.logout();

          } else if (err.status === 400) {

            this.showMessage(
              'Invalid request data'
            );

          } else if (err.status === 500) {

            this.showMessage(
              'Server error. Please try again later'
            );

          } else {

            this.showMessage(
              'Something went wrong. Please try again later'
            );
          }
        }

      });
  }

  // ============================================================
  // FILTER CHANGE
  // ============================================================

  onFilterChange(): void {

    console.log(
      'Filter changed:',
      {
        postDate: this.postDate,
        schemeType: this.schemeType
      }
    );

    this.loadSchemes();
  }

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  clearFilters(): void {

    console.log(
      'Clearing filters'
    );

    this.postDate = '';

    this.schemeType = '';

    this.loadSchemes();
  }

  // ============================================================
  // INITIALIZE DATATABLE
  // ============================================================

  initializeDataTable(): void {

    // ------------------------------------------------------------
    // Don't initialize when there are no records
    // ------------------------------------------------------------

    if (
      this.mySchemes().length === 0
    ) {

      console.log(
        'No schemes found. DataTable not initialized.'
      );

      return;
    }

    // ------------------------------------------------------------
    // Safety destroy
    // ------------------------------------------------------------

    if (
      $.fn.DataTable.isDataTable(
        '#mySchemesTable'
      )
    ) {

      ($('#mySchemesTable') as any)
        .DataTable()
        .destroy();
    }

    // ------------------------------------------------------------
    // Initialize DataTable
    // ------------------------------------------------------------

    console.log(
      'Initializing DataTable'
    );

    ($('#mySchemesTable') as any)
      .DataTable({

        dom: 'Bfrtip',

        buttons: [
          'excel',
          'pdf'
        ],

        responsive: true,

        pageLength: 10,

        ordering: true,

        searching: true,

        lengthChange: true,

        autoWidth: false

      });
  }

  // ============================================================
  // DESTROY DATATABLE
  // ============================================================

  destroyDataTable(): void {

    if (
      $.fn.DataTable.isDataTable(
        '#mySchemesTable'
      )
    ) {

      console.log(
        'Destroying existing DataTable'
      );

      ($('#mySchemesTable') as any)
        .DataTable()
        .clear()
        .destroy();
    }
  }

  // ============================================================
  // EDIT SCHEME
  // ============================================================

  handleEdit(schemeObj: any): void {

    console.log(
      'Edit scheme:',
      schemeObj
    );

    this.router.navigate(
      ['/admin/schemes/add'],
      {
        state: {
          scheme: schemeObj,
          isEdit: true
        }
      }
    );
  }

  // ============================================================
  // VIEW SCHEME
  // ============================================================

  handleView(id: any): void {

    this.router.navigate(
      ['/admin/schemes/view-scheme'],
      {
        state: {
          schemeID: id
        }
      }
    );
  }

  // ============================================================
  // CONFIRM DELETE
  // ============================================================

  confirmDelete(id: string): void {

    if (
      confirm(
        'Are you sure you want to delete this record?'
      )
    ) {

      this.deleteScheme(id);
    }
  }

  // ============================================================
  // DELETE SCHEME
  // ============================================================

  deleteScheme(id: string): void {

    const payload = JSON.stringify({
      id: id,
      master_id: '10'
    });

    console.log(
      'deleteScheme payload:',
      payload
    );

    this.loader.show();

    this.apiService
      .request(
        'POST',
        '/deleteRecord',
        payload
      )
      .subscribe({

        // ======================================================
        // SUCCESS
        // ======================================================

        next: (res: any) => {

          console.log(
            'Delete response:',
            res
          );

          this.loader.hide();

          this.showMessage(
            res.message ||
            'Scheme deleted successfully'
          );

          // ----------------------------------------------------
          // Remove record from Angular signal
          // ----------------------------------------------------

          this.mySchemes.update(
            (schemes: any[]) => {

              return schemes.filter(
                (scheme: any) =>
                  String(scheme.id) !== String(id)
              );

            }
          );

          // ----------------------------------------------------
          // Reload DataTable
          // ----------------------------------------------------

          setTimeout(() => {

            this.destroyDataTable();

            setTimeout(() => {

              this.initializeDataTable();

            }, 100);

          }, 100);

        },

        // ======================================================
        // ERROR
        // ======================================================

        error: (err: any) => {

          console.error(
            'Delete scheme error:',
            err
          );

          this.loader.hide();

          if (err.status === 401) {

            this.message.set(
              'Token expired'
            );

            this.isMessage = true;

            this.authService.logout();

          } else if (err.status === 400) {

            this.showMessage(
              'Invalid request data'
            );

          } else if (err.status === 500) {

            this.showMessage(
              'Server error. Please try again later'
            );

          } else {

            this.showMessage(
              'Something went wrong. Please try again later'
            );
          }
        }

      });
  }

  // ============================================================
  // SHOW MESSAGE
  // ============================================================

  showMessage(msg: string): void {

    this.message.set(
      msg
    );

    this.isMessage = true;

    setTimeout(() => {

      this.isMessage = false;

    }, 3000);
  }

}