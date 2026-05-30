import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
export class UserDashboardComponent {
  // Stats Counters Cards
  statsCards = signal<StatsCard[]>([
    { label: 'Events Won', value: '3', icon: 'trophy' },
    { label: 'Total Events', value: '12', icon: 'ribbon' },
    { label: 'Win Rate', value: '25%', icon: 'chart' },
    { label: 'Upcoming', value: '2', icon: 'calendar' }
  ]);

  // Registered Active Events
  registeredEvents = signal<RegisteredEvent[]>([
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

  // Past Participation Trophies
  pastParticipation = signal<PastEvent[]>([
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

  // Player Profile Information
  profileStats = signal<ProfileStats>({
    totalEvents: 12,
    eventsWon: 3,
    sportsPlayed: 3,
    memberSince: 'January 2026',
    favoriteSports: ['Running', 'Football', 'Badminton']
  });
}
