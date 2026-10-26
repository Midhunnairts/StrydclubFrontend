import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  get isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  get showCtaBanner(): boolean {
    const currentUrl = this.router.url;
    // Show CTA banner on main public/community screens
    return !currentUrl.startsWith('/admin') && !currentUrl.startsWith('/host-event') && !currentUrl.startsWith('/login');
  }
}
