import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  activeTab = signal<string>('Home');
  isMobileMenuOpen = signal<boolean>(false);

  navItems = [
    { label: 'Home', link: '/' },
    { label: 'Events', link: '/events' },
    { label: 'Sports', link: '/sports' },
    { label: 'Community', link: '/community' },
    { label: 'About', link: '/' },
    { label: 'Contact', link: '/' }
  ];

  setActiveTab(tabName: string) {
    this.activeTab.set(tabName);
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(open => !open);
  }
}
