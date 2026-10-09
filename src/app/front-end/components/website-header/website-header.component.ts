import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-website-header',
  templateUrl: './website-header.component.html',
  styleUrls: ['./website-header.component.scss'],
})
export class WebsiteHeaderComponent {

  isScrolled = false;
  isMenuOpen = false;
  activeSection = 'home';

  constructor(private router: Router) {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  goHome(): void {
    this.closeMenu();
    this.activeSection = 'home';

    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        }, 100);
      });
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  }

  navigateToSection(section: string): void {
    this.closeMenu();
    this.activeSection = section;

    // Already on Home page
    if (this.router.url === '/' || this.router.url === '') {
      setTimeout(() => {
        this.scrollToSection(section);
      }, 50);

      return;
    }

    // Navigate to Home first
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        this.scrollToSection(section);
      }, 300);
    });
  }

  private scrollToSection(section: string): void {

    const element = document.getElementById(section);

    if (!element) {
      console.warn(`Section not found: #${section}`);
      return;
    }

    const header = document.getElementById('header');

    const headerHeight = header
      ? header.offsetHeight
      : 0;

    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;

    const scrollPosition =
      elementPosition - headerHeight - 1;

    window.scrollTo({
      top: scrollPosition,
      left: 0,
      behavior: 'smooth',
    });
  }
}