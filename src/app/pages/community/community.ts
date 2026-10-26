import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface StatItem {
  iconName: string;
  value: string;
  label: string;
}

interface LeaderboardItem {
  id?: string;
  rank: number;
  name: string;
  sport: string;
  eventsCount: number;
}

interface CityItem {
  name: string;
  membersCount: number;
  eventsCount: number;
}

interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class CommunityComponent implements OnInit {
  private apiService = inject(ApiService);

  private router = inject(Router);

  stats = signal<StatItem[]>([
    { iconName: 'members', value: '', label: 'Active Members' },
    { iconName: 'cities', value: '', label: 'Cities Covered' },
    { iconName: 'events', value: '', label: 'Total Events' }
  ]);

  // Initialized with offline static fallbacks, updated dynamically via API
  leaderboard = signal<LeaderboardItem[]>([
  ]);

  cities = signal<CityItem[]>([]);

  testimonials = signal<TestimonialItem[]>([]);

  ngOnInit() {
    this.loadLeaderboard();
    this.loadPublicStats();
  }

  loadPublicStats() {
    this.apiService.getPublicStats().subscribe({
      next: (res) => {
        if (res && res.success && res.stats) {
          this.stats.set([
            { iconName: 'members', value: res.stats.athletesText, label: 'Active Members' },
            { iconName: 'cities', value: res.stats.citiesText, label: 'Cities Covered' },
            { iconName: 'events', value: res.stats.eventsText, label: 'Total Events' }
          ]);

          if (res.stats.cityList && res.stats.cityList.length > 0) {
            this.cities.set(res.stats.cityList);
          }
        }
      },
      error: (err) => {
        console.warn('Could not load dynamic community stats:', err);
      }
    });
  }

  loadLeaderboard() {
    this.apiService.getLeaderboard()
      .subscribe({
        next: (res) => {
          if (res && res.success && Array.isArray(res.leaderboard)) {
            const mapped = res.leaderboard.map(e => ({
              id: e.id || e._id || '',
              rank: e.rank,
              name: e.name || 'Athlete',
              sport: e.sport || 'Sports',
              eventsCount: typeof e.eventsCount === 'number' ? e.eventsCount : (parseInt(String(e.eventsCount || 0), 10) || 0)
            }));
            this.leaderboard.set(mapped);
          }
        },
        error: (err) => {
          console.warn('Backend server offline. Keeping static community ranks fallback...', err);
        }
      });
  }

  viewUserProfile(row: any) {
    if (row.id) {
      this.router.navigate(['/profile', row.id]);
    } else {
      this.router.navigate(['/profile', 'mock'], {
        queryParams: {
          name: row.name,
          sport: row.sport || 'Sports',
          events: row.eventsCount
        }
      });
    }
  }
}
