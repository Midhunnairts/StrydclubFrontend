import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class CommunityComponent {
  stats = signal<StatItem[]>([
    { iconName: 'members', value: '12,500+', label: 'Active Members' },
    { iconName: 'cities', value: '24', label: 'Cities Covered' },
    { iconName: 'events', value: '850+', label: 'Total Events' },
    { iconName: 'champions', value: '2,400+', label: 'Champions Crowned' }
  ]);

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
}
