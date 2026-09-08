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
    { iconName: 'members', value: '12,500+', label: 'Active Members' },
    { iconName: 'cities', value: '24', label: 'Cities Covered' },
    { iconName: 'events', value: '850+', label: 'Total Events' }
  ]);

  // Initialized with offline static fallbacks, updated dynamically via API
  leaderboard = signal<LeaderboardItem[]>([
    {
      rank: 1,
      name: 'Vikram Singh',
      sport: 'Running',
      eventsCount: 24
    },
    {
      rank: 2,
      name: 'Anjali Verma',
      sport: 'Badminton',
      eventsCount: 22
    },
    {
      rank: 3,
      name: 'Rohan Patel',
      sport: 'Football',
      eventsCount: 20
    },
    {
      rank: 4,
      name: 'Sneha Reddy',
      sport: 'Volleyball',
      eventsCount: 18
    },
    {
      rank: 5,
      name: 'Karthik Iyer',
      sport: 'Running',
      eventsCount: 16
    }
  ]);

  cities = signal<CityItem[]>([
    { name: 'Bangalore', membersCount: 3200, eventsCount: 145 },
    { name: 'Mumbai', membersCount: 2800, eventsCount: 132 },
    { name: 'Delhi', membersCount: 2500, eventsCount: 118 },
    { name: 'Hyderabad', membersCount: 1900, eventsCount: 95 },
    { name: 'Pune', membersCount: 1600, eventsCount: 82 },
    { name: 'Chennai', membersCount: 1400, eventsCount: 76 }
  ]);

  testimonials = signal<TestimonialItem[]>([
    {
      name: 'Rahul Sharma',
      role: 'Marathon Runner',
      quote: '"Strydclub transformed my fitness journey. The community is incredibly supportive and the events are well-organized."'
    },
    {
      name: 'Priya Desai',
      role: 'Badminton Enthusiast',
      quote: '"I\'ve met amazing people and improved my game significantly. Best sports community I\'ve been part of!"'
    },
    {
      name: 'Amit Kumar',
      role: 'Football Player',
      quote: '"The Friday night football leagues are the highlight of my week. Great competition and even better friendships."'
    }
  ]);

  ngOnInit() {
    this.loadLeaderboard();
    this.loadPublicStats();
  }

  loadPublicStats() {
    this.apiService.getPublicStats().subscribe({
      next: (res) => {
        if (res && res.success && res.stats) {
          this.stats.set([
            { iconName: 'members', value: res.stats.athletesText || '12,500+', label: 'Active Members' },
            { iconName: 'cities', value: res.stats.citiesText || '24', label: 'Cities Covered' },
            { iconName: 'events', value: res.stats.eventsText || '850+', label: 'Total Events' }
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
