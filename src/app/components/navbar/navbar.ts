import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  private router = inject(Router);

  activeTab = signal<string>('Home');
  isMobileMenuOpen = signal<boolean>(false);

  navItems = [
    { label: 'Home', link: '/' },
    { label: 'Events', link: '/events' },
    { label: 'Sports', link: '/sports' },
    { label: 'Community', link: '/community' },
    { label: 'About', link: '/about' },
    { label: 'Contact', link: '/contact' }
  ];

  get isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  get isAdmin(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.role === 'admin';
        } catch (e) {
          return false;
        }
      }
    }
    return false;
  }

  setActiveTab(tabName: string) {
    this.activeTab.set(tabName);
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(open => !open);
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.isMobileMenuOpen.set(false);
    this.router.navigate(['/login']);
  }
}

