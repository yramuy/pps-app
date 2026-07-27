import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements AfterViewInit, OnDestroy {

  @ViewChild('sliderTrack') sliderTrack!: ElementRef<HTMLDivElement>;

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