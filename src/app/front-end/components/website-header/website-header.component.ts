import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-website-header',
  templateUrl: './website-header.component.html',
  styleUrls: ['./website-header.component.scss']
})
export class WebsiteHeaderComponent {

  isScrolled = false;
  isMenuOpen = false;
  progressWidth = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {

    this.isScrolled = window.scrollY > 40;

    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    this.progressWidth =
      docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

}
