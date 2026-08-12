import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface EventItem {
  id: string;
  title: string;
  category: string;
  image: string;
  price: number;
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
      category: 'RUNNING',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
      price: 499,
      date: 'May 28, 2026 · 6:00 AM',
      location: 'Cubbon Park, Bangalore',
      slotsFilled: 45,
      slotsTotal: 100
    },
    {
      id: 'inter-city-badminton-tournament',
      title: 'Inter-City Badminton Tournament',
      category: 'BADMINTON',
      image: 'https://images.unsplash.com/photo-1626225967045-94408422615d?auto=format&fit=crop&w=800&q=80',
      price: 799,
      date: 'June 2, 2026 · 9:00 AM',
      location: 'Sports Complex, Mumbai',
      slotsFilled: 12,
      slotsTotal: 32
    },
    {
      id: 'friday-night-football-league',
      title: 'Friday Night Football League',
      category: 'FOOTBALL',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      price: 599,
      date: 'May 25, 2026 · 7:00 PM',
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
        if (res.success && res.events && res.events.length > 0) {
          const defaultImages: Record<string, string> = {
            'Running': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
            'Badminton': 'https://images.unsplash.com/photo-1626225967045-94408422615d?auto=format&fit=crop&w=800&q=80',
            'Football': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
          };
          const featured = res.events.slice(0, 3).map(e => ({
            id: e.slug || e._id,
            title: e.title,
            category: e.category.toUpperCase(),
            image: e.image || defaultImages[e.category] || 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
            price: e.price || 499,
            date: `${e.date} · ${e.time}`,
            location: e.location,
            slotsFilled: e.slotsFilled,
            slotsTotal: e.slotsTotal
          }));
          this.events.set(featured);
        }
      },
      error: () => {
        console.warn('Backend server offline. Keeping featured events fallback...');
      }
    });
  }

  getSlotsPercentage(event: EventItem): number {
    if (event.slotsTotal === 0) return 0;
    return (event.slotsFilled / event.slotsTotal) * 100;
  }
}

