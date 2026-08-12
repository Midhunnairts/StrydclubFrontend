import { Component, signal, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private elementRef = inject(ElementRef);

  activeTab = signal<string>('Home');
  isMobileMenuOpen = signal<boolean>(false);
  isProfileDropdownOpen = signal<boolean>(false);

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
    const user = this.apiService.currentUser();
    return user ? user.role === 'admin' : false;
  }

  get userDisplayName(): string {
    const user = this.apiService.currentUser();
    return user?.name || 'Arjun Sharma';
  }

  get userDisplayEmail(): string {
    const user = this.apiService.currentUser();
    return user?.email || user?.phone || 'arjun@email.com';
  }

  get userRoleBadge(): string {
    const user = this.apiService.currentUser();
    return (user?.role || 'admin').toUpperCase();
  }

  setActiveTab(tabName: string) {
    this.activeTab.set(tabName);
    this.isMobileMenuOpen.set(false);
    this.isProfileDropdownOpen.set(false);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(open => !open);
    this.isProfileDropdownOpen.set(false);
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    this.isProfileDropdownOpen.update(open => !open);
  }

  closeDropdown() {
    this.isProfileDropdownOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.apiService.logout();
    this.isMobileMenuOpen.set(false);
    this.isProfileDropdownOpen.set(false);
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileDropdownOpen.set(false);
    }
  }
}

