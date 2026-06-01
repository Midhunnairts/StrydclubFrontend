import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  slotsFilled: number;
  slotsTotal: number;
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss'
})
export class EventListComponent implements OnInit {
  private apiService = inject(ApiService);

  events = signal<EventItem[]>([
    {
      id: 'weekend-5k-marathon',
      title: 'Weekend 5K Marathon',
      category: 'Running',
      date: 'May 28, 2026 • 6:00 AM',
      location: 'Cubbon Park, Bangalore',
      slotsFilled: 45,
      slotsTotal: 100
    },
    {
      id: 'inter-city-badminton-tournament',
      title: 'Inter-City Badminton Tournament',
      category: 'Badminton',
      date: 'June 2, 2026 • 9:00 AM',
      location: 'Sports Complex, Mumbai',
      slotsFilled: 12,
      slotsTotal: 32
    },
    {
      id: 'friday-night-football-league',
      title: 'Friday Night Football League',
      category: 'Football',
      date: 'May 25, 2026 • 7:00 PM',
      location: 'Green Field Arena, Delhi',
      slotsFilled: 8,
      slotsTotal: 22
    }
  ]);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.apiService.getEvents().subscribe({
      next: (res) => {
        if (res.success) {
          // Take the first 3 events for the featured home section
          const featured = res.events.slice(0, 3).map(e => ({
            id: e.slug || e._id,
            title: e.title,
            category: e.category,
            date: `${e.date} • ${e.time}`,
            location: e.location,
            slotsFilled: e.slotsFilled,
            slotsTotal: e.slotsTotal
          }));
          this.events.set(featured);
        }
      },
      error: (err) => {
        console.warn('Backend server offline. Keeping featured events list fallback...');
      }
    });
  }

  getSlotsPercentage(event: EventItem): number {
    if (event.slotsTotal === 0) return 0;
    return (event.slotsFilled / event.slotsTotal) * 100;
  }
}

