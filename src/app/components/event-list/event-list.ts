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
            'Running': '/assets/Run.jpg',
            'Badminton': '/assets/Badminton.jpg',
            'Football': '/assets/Football.jpg',
            'Volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
            'Pickleball': '/assets/Pickleball.webp',
            'Cricket': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
            'Kho Kho': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
            'Other': '/assets/Other.jpg'
          };
          const featured = res.events.slice(0, 3).map(e => ({
            id: e._id || e.slug,
            title: e.title,
            category: e.category.toUpperCase(),
            image: e.bannerUrl || e.image || defaultImages[e.category] || 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
            price: e.price || "Free",
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

