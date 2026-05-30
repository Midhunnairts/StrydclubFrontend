import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface StatsCard {
  label: string;
  value: string;
  icon: 'trophy' | 'ribbon' | 'chart' | 'calendar';
}

interface RegisteredEvent {
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  status: string;
}

interface PastEvent {
  title: string;
  category: string;
  date: string;
  result: string;
  won: boolean;
}

interface ProfileStats {
  totalEvents: number;
  eventsWon: number;
  sportsPlayed: number;
  memberSince: string;
  favoriteSports: string[];
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss'
})
export class UserDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Stats Counters Cards Writable Signal
  statsCards = signal<StatsCard[]>([
    { label: 'Events Won', value: '3', icon: 'trophy' },
    { label: 'Total Events', value: '12', icon: 'ribbon' },
    { label: 'Win Rate', value: '25%', icon: 'chart' },
    { label: 'Upcoming', value: '2', icon: 'calendar' }
  ]);

  // Registered Active Events Writable Signal
  registeredEvents = signal<RegisteredEvent[]>([]);

  // Past Participation Trophies Writable Signal
  pastParticipation = signal<PastEvent[]>([]);

  // Player Profile Information Writable Signal
  profileStats = signal<ProfileStats>({
    totalEvents: 12,
    eventsWon: 3,
    sportsPlayed: 3,
    memberSince: 'January 2026',
    favoriteSports: ['Running', 'Football', 'Badminton']
  });

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('Unauthorized access. Redirecting to login route...');
      this.router.navigate(['/login']);
      return;
    }

    this.apiService.getUserDashboard(token).subscribe({
      next: (res) => {
        if (res.success) {
          // Set stats counters signals
          this.statsCards.set([
            { label: 'Events Won', value: res.stats.eventsWon.toString(), icon: 'trophy' },
            { label: 'Total Events', value: res.stats.totalEvents.toString(), icon: 'ribbon' },
            { label: 'Win Rate', value: res.stats.winRate, icon: 'chart' },
            { label: 'Upcoming', value: res.stats.upcomingCount.toString(), icon: 'calendar' }
          ]);

          // Set logs and profile details signals
          this.registeredEvents.set(res.registeredEvents || []);
          this.pastParticipation.set(res.pastParticipation || []);
          this.profileStats.set(res.profileStats);
        }
      },
      error: (err) => {
        console.warn('Backend server offline or auth failed. Utilizing dashboard mock fallbacks...');
        // Bootstrapping seeded looking fallbacks
        this.registeredEvents.set([
          {
            title: 'Weekend 5K Marathon',
            category: 'Running',
            date: 'May 28, 2026',
            time: '6:00 AM',
            location: 'Cubbon Park, Bangalore',
            status: 'Confirmed'
          },
          {
            title: 'Friday Night Football League',
            category: 'Football',
            date: 'May 25, 2026',
            time: '7:00 PM',
            location: 'Green Field Arena, Delhi',
            status: 'Confirmed'
          }
        ]);

        this.pastParticipation.set([
          {
            title: 'Spring Badminton Championship',
            category: 'Badminton',
            date: 'May 15, 2026',
            result: '2nd Place',
            won: true
          },
          {
            title: 'Urban Football League',
            category: 'Football',
            date: 'May 10, 2026',
            result: 'Participant',
            won: false
          }
        ]);
      }
    });
  }
}
