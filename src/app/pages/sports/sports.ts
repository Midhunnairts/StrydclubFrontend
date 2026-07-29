import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface NextEventInfo {
  title: string;
  date: string;
  time: string;
  location: string;
}

interface SportPageItem {
  name: string;
  icon: string;
  description: string;
  eventsCount: number;
  membersCount: number;
  nextEvent: NextEventInfo;
}

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sports.html',
  styleUrl: './sports.scss'
})
export class SportsComponent implements OnInit {
  private apiService = inject(ApiService);

  sports = signal<SportPageItem[]>([
    {
      name: 'Running',
      icon: '🏃',
      description: 'From 5K sprints to full marathons, join runners pushing their limits.',
      eventsCount: 12,
      membersCount: 2400,
      nextEvent: {
        title: 'Weekend 5K Marathon',
        date: 'May 28, 2026',
        time: '6:00 AM',
        location: 'Cubbon Park, Bangalore'
      }
    },
    {
      name: 'Badminton',
      icon: '🏸',
      description: 'Singles and doubles tournaments for all skill levels.',
      eventsCount: 8,
      membersCount: 1800,
      nextEvent: {
        title: 'Inter-City Badminton Tournament',
        date: 'June 2, 2026',
        time: '9:00 AM',
        location: 'Sports Complex, Mumbai'
      }
    },
    {
      name: 'Football',
      icon: '⚽',
      description: 'High-intensity leagues and casual matches for football fans.',
      eventsCount: 15,
      membersCount: 3200,
      nextEvent: {
        title: 'Friday Night Football League',
        date: 'May 25, 2026',
        time: '7:00 PM',
        location: 'Green Field Arena, Delhi'
      }
    },
    {
      name: 'Volleyball',
      icon: '🏐',
      description: 'Beach and indoor volleyball leagues for teams and individuals.',
      eventsCount: 10,
      membersCount: 1500,
      nextEvent: {
        title: 'Sunrise Volleyball Championship',
        date: 'May 30, 2026',
        time: '5:30 AM',
        location: 'Beach Courts, Goa'
      }
    },
    {
      name: 'Pickleball',
      icon: '🎾',
      description: 'Fast-growing paddle sport that combines elements of tennis and badminton.',
      eventsCount: 6,
      membersCount: 950,
      nextEvent: {
        title: 'Pickleball Pro League',
        date: 'June 5, 2026',
        time: '10:00 AM',
        location: 'Indoor Arena, Pune'
      }
    },
    {
      name: 'Kho Kho',
      icon: '🎯',
      description: 'Traditional Indian tag sport played with speed, agility, and teamwork.',
      eventsCount: 5,
      membersCount: 1100,
      nextEvent: {
        title: 'Traditional Kho Kho Challenge',
        date: 'June 8, 2026',
        time: '4:00 PM',
        location: 'Stadium, Hyderabad'
      }
    },
    {
      name: 'Cricket',
      icon: '🏏',
      description: 'Exciting court sport blending tennis and squash inside glass enclosures.',
      eventsCount: 4,
      membersCount: 650,
      nextEvent: {
        title: 'Cricket Club Challenge',
        date: 'June 12, 2026',
        time: '6:00 PM',
        location: 'Cricket Arena, Hyderabad'
      }
    },
    {
      name: 'Other',
      icon: '✨',
      description: 'Custom hosted events covering a wide variety of exciting sports.',
      eventsCount: 2,
      membersCount: 450,
      nextEvent: {
        title: 'Community Hosted Event',
        date: 'TBD',
        time: 'TBD',
        location: 'Strydclub Center'
      }
    }
  ]);

  ngOnInit() {
    this.loadSports();
  }

  loadSports() {
    this.apiService.getSports().subscribe({
      next: (res) => {
        if (res.success) {
          this.sports.set(res.sports);
        }
      },
      error: (err) => {
        console.warn('Backend server offline. Utilizing sports mock dataset fallback...');
      }
    });
  }
}
