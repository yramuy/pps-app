import { Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-brand-marquee',
  templateUrl: './brand-marquee.component.html',
  styleUrls: ['./brand-marquee.component.scss'],
})
export class BrandMarqueeComponent {
  categories: any = [];
  message: any = '';

  constructor(private apiService: ApiService) {
    this.loadCategories();
  }

  loadCategories() {
    const payload = {
      master_id: '1',
      mode: 'mobile',
    };

    this.apiService.request('POST', '/masterData', payload).subscribe({
      next: (res: any) => {
        this.categories = res.master_data || [];

      },

      error: (err: any) => {
        if (err.status === 401) {
        } else if (err.status === 400) {
          this.message.set('Invalid request data');
        } else if (err.status === 500) {
          this.message.set('Server error. Please try again later');
        } else {
          this.message.set('Something went wrong. Please try again later');
        }
      },
    });
  }
}
