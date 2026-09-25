import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements AfterViewInit, OnDestroy {

  @ViewChild('sliderTrack') sliderTrack!: ElementRef<HTMLDivElement>;

  advertisements: any = [];
  message: any = '';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    this.loadAdvertisements();
  }

  loadAdvertisements() {

    let payload = {
      mode: 0
    };

    this.apiService.request('POST', '/allAdvertisements', payload).subscribe({
      next: (res: any) => {
        this.advertisements = res.advertisements || [];
      },

      error: (err: any) => {
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

  currentIndex = 0;
  autoplay: any;

  ngAfterViewInit(): void {
    this.startAutoPlay();
  }

  visibleItems(): number {
    return window.innerWidth <= 768 ? 1 : 2;
  }

  updateSlider(): void {
    const track = this.sliderTrack.nativeElement;
    const items = track.querySelectorAll('.ad-item');

    if (!items.length) {
      return;
    }

    const itemWidth = (items[0] as HTMLElement).offsetWidth;

    track.style.transform = `translateX(-${this.currentIndex * itemWidth}px)`;
  }

  nextSlide(): void {

    const items = this.sliderTrack.nativeElement.querySelectorAll('.ad-item');
    const maxIndex = items.length - this.visibleItems();

    this.currentIndex++;

    if (this.currentIndex > maxIndex) {
      this.currentIndex = 0;
    }

    this.updateSlider();
  }

  prevSlide(): void {

    const items = this.sliderTrack.nativeElement.querySelectorAll('.ad-item');
    const maxIndex = items.length - this.visibleItems();

    this.currentIndex--;

    if (this.currentIndex < 0) {
      this.currentIndex = maxIndex;
    }

    this.updateSlider();
  }

  startAutoPlay(): void {

    this.stopAutoPlay();

    this.autoplay = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  stopAutoPlay(): void {

    if (this.autoplay) {
      clearInterval(this.autoplay);
    }
  }

  @HostListener('window:resize')
  onResize(): void {

    this.currentIndex = 0;
    this.updateSlider();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }
}