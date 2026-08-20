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

  events = signal<EventItem[]>([]);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.apiService.getEvents().subscribe({
      next: (res) => {
        if (res.success && res.events) {
          const defaultImages: Record<string, string> = {
            'Running': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
            'Badminton': 'https://images.unsplash.com/photo-1626225967045-94408422615d?auto=format&fit=crop&w=800&q=80',
            'Football': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
          };
          const featured = res.events.slice(0, 3).map(e => ({
            id: e.slug || e._id,
            title: e.title,
            category: e.category.toUpperCase(),
            image: e.bannerUrl || e.image || defaultImages[e.category] || 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
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
        this.events.set([]);
      }
    });
  }

  getSlotsPercentage(event: EventItem): number {
    if (event.slotsTotal === 0) return 0;
    return (event.slotsFilled / event.slotsTotal) * 100;
  }
}

