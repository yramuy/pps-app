import {
  Component,
  signal
} from '@angular/core';

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

  // ================================
  // Signals
  // ================================

  myAdvertisements = signal<any[]>([]);

  loginUser = signal<any>(null);

  loading = signal(false);

  message = signal('');

  isMessage: boolean = false;


  // ================================
  // Filters
  // ================================

  advertisementType: string = '';


  constructor(
    private authService: AuthService,

    private apiService: ApiService,

    public loader: LoaderService,

    private router: Router
  ) {

    this.loadAdvertisements();

  }


  // ================================
  // On Init
  // ================================

  ngOnInit() {

    const state = history.state;

    if (state.message) {

      this.message.set(state.message);

      this.isMessage = true;

      // Clear history
      history.replaceState({}, '');

      setTimeout(() => {

        this.isMessage = false;

      }, 3000);

    }

  }


  // ================================
  // Filter Change
  // ================================

  onFilterChange(): void {

    this.loadAdvertisements();

  }


  // ================================
  // Clear Filters
  // ================================

  clearFilters(): void {

    this.advertisementType = '';

    this.loadAdvertisements();

  }


  // ================================
  // Load Advertisements
  // ================================

  loadAdvertisements(): void {

    this.loader.show();


    const payload = {

      mode: 1,

      advertisement_type:
        this.advertisementType || ''

    };


    this.apiService
      .request(
        'POST',
        '/allAdvertisements',
        payload
      )
      .subscribe({

        next: (res: any) => {

          /*
           * Destroy existing DataTable
           * before changing Angular data.
           */
          if (
            $.fn.DataTable.isDataTable(
              '#myAdvertisementsTable'
            )
          ) {

            ($('#myAdvertisementsTable') as any)
              .DataTable()
              .clear()
              .destroy();

          }


          /*
           * Set API response.
           */
          this.myAdvertisements.set(
            res.advertisements || []
          );


          console.log(
            'myAdvertisements:',
            this.myAdvertisements()
          );


          this.loader.hide();


          /*
           * Reinitialize DataTable after
           * Angular updates the DOM.
           */
          setTimeout(() => {

            this.initializeDataTable();

          }, 0);

        },


        error: (err: any) => {

          if (err.status === 401) {

            this.message.set(
              'Token expired'
            );

            this.authService.logout();

          }

          else if (err.status === 400) {

            this.message.set(
              'Invalid request data'
            );

          }

          else if (err.status === 500) {

            this.message.set(
              'Server error. Please try again later'
            );

          }

          else {

            this.message.set(
              'Something went wrong. Please try again later'
            );

          }


          this.loader.hide();

        }

      });

  }


  // ================================
  // Initialize DataTable
  // ================================

  initializeDataTable(): void {

    if (
      this.myAdvertisements().length === 0
    ) {

      return;

    }


    if (
      $.fn.DataTable.isDataTable(
        '#myAdvertisementsTable'
      )
    ) {

      ($('#myAdvertisementsTable') as any)
        .DataTable()
        .destroy();

    }


    ($('#myAdvertisementsTable') as any)
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


  // ================================
  // Edit
  // ================================

  handleEdit(
    advertisementObj: any
  ): void {

    this.router.navigate(
      ['/admin/advertisement/add'],
      {
        state: {

          advertisement:
            advertisementObj,

          isEdit: true

        }
      }
    );

  }


  // ================================
  // Delete Confirmation
  // ================================

  confirmDelete(
    id: string
  ): void {

    if (
      confirm(
        'Are you sure you want to delete this record?'
      )
    ) {

      this.deleteAdvertisement(id);

    }

  }


  // ================================
  // Delete Advertisement
  // ================================

  deleteAdvertisement(
    id: string
  ): void {

    const payload = JSON.stringify({

      id: id,

      master_id: '15'

    });


    this.loader.show();


    this.apiService
      .request(
        'POST',
        '/deleteRecord',
        payload
      )
      .subscribe({

        next: (res: any) => {

          this.loader.hide();


          if (res.status) {

            this.showMessage(
              res.message ||
              'Advertisement deleted successfully'
            );


            /*
             * Remove from signal.
             */
            this.myAdvertisements.update(
              (advertisements) =>
                advertisements.filter(
                  (advertisement: any) =>
                    advertisement.id !== id
                )
            );


            /*
             * Reload DataTable.
             */
            this.reloadDataTable();

          }

          else {

            this.showMessage(
              res.message ||
              'Unable to delete advertisement'
            );

          }

        },


        error: (err: any) => {

          this.loader.hide();

          console.error(
            'Delete advertisement error:',
            err
          );

          this.showMessage(
            'Something went wrong'
          );

        }

      });

  }


  // ================================
  // Reload DataTable
  // ================================

  reloadDataTable(): void {

    if (
      $.fn.DataTable.isDataTable(
        '#myAdvertisementsTable'
      )
    ) {

      ($('#myAdvertisementsTable') as any)
        .DataTable()
        .clear()
        .destroy();

    }


    setTimeout(() => {

      this.initializeDataTable();

    }, 100);

  }


  // ================================
  // Message
  // ================================

  showMessage(
    msg: string
  ): void {

    this.message.set(msg);

    this.isMessage = true;


    setTimeout(() => {

      this.isMessage = false;

    }, 3000);

  }

}