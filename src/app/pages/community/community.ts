import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface StatItem {
  iconName: string;
  value: string;
  label: string;
}

interface LeaderboardItem {
  rank: number;
  name: string;
  sport: string;
  eventsCount: number;
  winsCount: number;
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
  private http = inject(HttpClient);

  stats = signal<StatItem[]>([
    { iconName: 'members', value: '12,500+', label: 'Active Members' },
    { iconName: 'cities', value: '24', label: 'Cities Covered' },
    { iconName: 'events', value: '850+', label: 'Total Events' },
    { iconName: 'champions', value: '2,400+', label: 'Champions Crowned' }
  ]);

  // Initialized with offline static fallbacks, updated dynamically via API
  leaderboard = signal<LeaderboardItem[]>([
    {
      rank: 1,
      name: 'Vikram Singh',
      sport: 'Running',
      eventsCount: 24,
      winsCount: 12
    },
    {
      rank: 2,
      name: 'Anjali Verma',
      sport: 'Badminton',
      eventsCount: 22,
      winsCount: 11
    },
    {
      rank: 3,
      name: 'Rohan Patel',
      sport: 'Football',
      eventsCount: 20,
      winsCount: 9
    },
    {
      rank: 4,
      name: 'Sneha Reddy',
      sport: 'Volleyball',
      eventsCount: 18,
      winsCount: 8
    },
    {
      rank: 5,
      name: 'Karthik Iyer',
      sport: 'Running',
      eventsCount: 16,
      winsCount: 7
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
  }

  loadLeaderboard() {
    this.http.get<{ success: boolean; leaderboard: any[] }>('http://localhost:3000/api/community/leaderboard')
      .subscribe({
        next: (res) => {
          if (res.success) {
            const mapped = res.leaderboard.map(e => ({
              rank: e.rank,
              name: e.name,
              sport: e.sport,
              eventsCount: parseInt(e.eventsCount) || 10,
              winsCount: Math.round(parseInt(e.points.replace(/,/g, '')) / 200) || 5
            }));
            this.leaderboard.set(mapped);
          }
        },
        error: (err) => {
          console.warn('Backend server offline. Keeping static community ranks fallback...');
        }
      });
  }
}
