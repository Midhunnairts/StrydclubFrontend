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
            'Lifestyle': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
            'Surfing': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
            'Other': '/assets/Other.jpg'
          };
          const upcomingEvents = res.events.filter(e => {
            const isCompleted = e.status === 'Completed' || e.status === 'completed' || e.status === 'COMPLETED' || this.isEventPast(e.date, e.time, e.endTime);
            return !isCompleted;
          });

          const featured = upcomingEvents.slice(0, 3).map(e => ({
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

  isEventPast(dateStr: string, timeStr?: string, endTimeStr?: string): boolean {
    if (!dateStr) return false;
    const cleanDate = dateStr.trim();
    let targetTime = endTimeStr && endTimeStr.trim() ? endTimeStr.trim() : '';

    if (!targetTime && timeStr) {
      const rangeMatch = timeStr.match(/(?:-|to|–)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/i);
      if (rangeMatch) {
        targetTime = rangeMatch[1].trim();
      } else {
        targetTime = timeStr.trim();
      }
    }

    const parseTimeParts = (tStr: string) => {
      const m = tStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (!m) return null;
      let hours = parseInt(m[1], 10);
      const minutes = m[2] ? parseInt(m[2], 10) : 0;
      const ampm = m[3] ? m[3].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    };

    let d: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      const parts = cleanDate.split('-').map(Number);
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      d = new Date(cleanDate);
    }
    if (isNaN(d.getTime())) return false;

    const timeParts = targetTime ? parseTimeParts(targetTime) : null;
    if (timeParts) {
      d.setHours(timeParts.hours, timeParts.minutes, 0, 0);
      if (!endTimeStr || !endTimeStr.trim()) {
        d.setHours(d.getHours() + 1);
      }
    } else {
      d.setHours(23, 59, 59, 999);
    }

    return d < new Date();
  }

  getSlotsPercentage(event: EventItem): number {
    if (event.slotsTotal === 0) return 0;
    return (event.slotsFilled / event.slotsTotal) * 100;
  }
}

