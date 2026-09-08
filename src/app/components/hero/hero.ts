import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class HeroComponent implements OnInit {
  private apiService = inject(ApiService);

  athletesCount = signal<string>('12,500+');
  eventsCount = signal<string>('850+');
  citiesCount = signal<string>('24');

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.apiService.getPublicStats().subscribe({
      next: (res) => {
        if (res && res.success && res.stats) {
          if (res.stats.athletesText) this.athletesCount.set(res.stats.athletesText);
          if (res.stats.eventsText) this.eventsCount.set(res.stats.eventsText);
          if (res.stats.citiesText) this.citiesCount.set(res.stats.citiesText);
        }
      },
      error: (err) => {
        console.warn('Could not load dynamic public stats:', err);
      }
    });
  }

  get isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('token');
    }
    return false;
  }
}

