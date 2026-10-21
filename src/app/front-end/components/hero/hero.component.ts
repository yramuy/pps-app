import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { finalize } from 'rxjs/operators';

import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sliderTrack')
  sliderTrack!: ElementRef<HTMLDivElement>;

  // Advertisements
  advertisements: any[] = [];

  // Error message
  message: string = '';

  // Loader
  loading: boolean = true;

  // Slider
  currentIndex: number = 0;

  // Auto play
  autoplay: any = null;

  private pendingApiCalls = 0;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {}

  // --------------------------------------------------
  // Component Init
  // --------------------------------------------------

  ngAfterViewInit(): void {
    this.loadAdvertisements();
  }

  private requestWithLoader(endpoint: string, payload: any): any {
    this.pendingApiCalls++;
    this.isLoading = true;

    return this.apiService.request('POST', endpoint, payload).pipe(
      finalize(() => {
        this.pendingApiCalls = Math.max(0, this.pendingApiCalls - 1);
        this.isLoading = this.pendingApiCalls > 0;
      }),
    );
  }

  // --------------------------------------------------
  // Load Advertisements
  // --------------------------------------------------

  loadAdvertisements(): void {
    this.loading = true;

    const payload = {
      mode: 0,
    };

    this.requestWithLoader('/allAdvertisements', payload).subscribe({
      next: (res: any) => {
        console.log('Advertisement Response:', res);

        // Set advertisements
        this.advertisements = res.advertisements || [];

        // Hide loader
        this.loading = false;

        /*
         * Angular needs a moment to render
         * the *ngFor advertisement elements.
         */
        setTimeout(() => {
          this.currentIndex = 0;

          this.updateSlider();

          // Start autoplay only if
          // there are more advertisements
          // than visible items.
          if (this.advertisements.length > this.visibleItems()) {
            this.startAutoPlay();
          }
        }, 100);
      },

      error: (err: any) => {
        console.error('Advertisement API Error:', err);

        // Hide loader
        this.loading = false;

        // Stop slider
        this.stopAutoPlay();

        // Error messages
        if (err.status === 401) {
          this.message = 'Token expired';
        } else if (err.status === 400) {
          this.message = 'Invalid request data';
        } else if (err.status === 500) {
          this.message = 'Server error. Please try again later';
        } else {
          this.message = 'Something went wrong. Please try again later';
        }
      },
    });
  }

  // --------------------------------------------------
  // Number of Visible Items
  // --------------------------------------------------

  visibleItems(): number {
    return window.innerWidth <= 768 ? 1 : 2;
  }

  // --------------------------------------------------
  // Update Slider
  // --------------------------------------------------

  updateSlider(): void {
    if (!this.sliderTrack) {
      return;
    }

    const track = this.sliderTrack.nativeElement;

    const items = track.querySelectorAll<HTMLElement>('.ad-item');

    if (!items.length) {
      return;
    }

    const itemWidth = items[0].offsetWidth;

    track.style.transform = `translateX(-${this.currentIndex * itemWidth}px)`;
  }

  // --------------------------------------------------
  // Next Slide
  // --------------------------------------------------

  nextSlide(): void {
    if (!this.sliderTrack) {
      return;
    }

    const items = this.sliderTrack.nativeElement.querySelectorAll('.ad-item');

    if (!items.length) {
      return;
    }

    const visible = this.visibleItems();

    /*
     * If all advertisements are
     * already visible, do nothing.
     */
    if (items.length <= visible) {
      return;
    }

    const maxIndex = items.length - visible;

    this.currentIndex++;

    if (this.currentIndex > maxIndex) {
      this.currentIndex = 0;
    }

    this.updateSlider();
  }

  // --------------------------------------------------
  // Previous Slide
  // --------------------------------------------------

  prevSlide(): void {
    if (!this.sliderTrack) {
      return;
    }

    const items = this.sliderTrack.nativeElement.querySelectorAll('.ad-item');

    if (!items.length) {
      return;
    }

    const visible = this.visibleItems();

    /*
     * If all advertisements are
     * already visible, do nothing.
     */
    if (items.length <= visible) {
      return;
    }

    const maxIndex = items.length - visible;

    this.currentIndex--;

    if (this.currentIndex < 0) {
      this.currentIndex = maxIndex;
    }

    this.updateSlider();
  }

  // --------------------------------------------------
  // Start Auto Play
  // --------------------------------------------------

  startAutoPlay(): void {
    this.stopAutoPlay();

    this.autoplay = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  // --------------------------------------------------
  // Stop Auto Play
  // --------------------------------------------------

  stopAutoPlay(): void {
    if (this.autoplay) {
      clearInterval(this.autoplay);

      this.autoplay = null;
    }
  }

  // --------------------------------------------------
  // Window Resize
  // --------------------------------------------------

  @HostListener('window:resize')
  onResize(): void {
    this.currentIndex = 0;

    setTimeout(() => {
      this.updateSlider();
    }, 100);
  }

  // --------------------------------------------------
  // Destroy
  // --------------------------------------------------

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }
}
