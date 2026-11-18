import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface SportItem {
  name: string;
  badge: string;
  image: string;
  eventsCount: number;
}

@Component({
  selector: 'app-sport-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sport-list.html',
  styleUrl: './sport-list.scss'
})
export class SportListComponent implements OnInit {
  private apiService = inject(ApiService);

  sports = signal<SportItem[]>([

  ]);

  ngOnInit() {
    this.loadSports();
  }

  loadSports() {
    this.apiService.getSports().subscribe({
      next: (res) => {
        console.log(res);

        if (res.success && res.sports) {
          const defaultBadges: Record<string, string> = {
            'Running': 'MOST POPULAR',
            'Badminton': 'INDOOR',
            'Football': 'TEAM SPORT',
            'Volleyball': 'BEACH & INDOOR',
            'Pickleball': 'FAST GROWING',
            'Lifestyle': 'WELLNESS & FUN',
            'Surfing': 'WATER SPORT',
            'Other': 'EXPLORE MORE'
          };
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
          const mapped = res.sports.map(s => ({
            name: s.name,
            badge: s.badge || defaultBadges[s.name] || 'FEATURED',
            image: s.image || defaultImages[s.name] || 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
            eventsCount: typeof s.upcomingEventsCount === 'number' ? s.upcomingEventsCount : (s.eventsCount || 0)
          }));
          this.sports.set(mapped);

          // If backend didn't provide upcomingEventsCount specifically, calculate accurately from active events
          if (res.sports.some(s => typeof s.upcomingEventsCount !== 'number')) {
            this.recalculateUpcomingFromEvents();
          }
        }
      },
      error: () => {
        this.sports.set([]);
      }
    });
  }

  private recalculateUpcomingFromEvents() {
    this.apiService.getEvents().subscribe({
      next: (eventsRes) => {
        if (eventsRes.success && eventsRes.events) {
          const upcomingCounts: Record<string, number> = {};
          const standardCategories = ['Running', 'Badminton', 'Football', 'Volleyball', 'Pickleball', 'Lifestyle', 'Surfing'];

          eventsRes.events.forEach(e => {
            const isCompleted = this.isEventCompleted(e);
            if (!isCompleted) {
              const cat = (e.category || '').trim();
              const matchedCat = standardCategories.find(c => c.toLowerCase() === cat.toLowerCase()) || 'Other';
              upcomingCounts[matchedCat] = (upcomingCounts[matchedCat] || 0) + 1;
            }
          });

          this.sports.update(currentList =>
            currentList.map(sport => ({
              ...sport,
              eventsCount: upcomingCounts[sport.name] || 0
            }))
          );
        }
      }
    });
  }

  private isEventCompleted(e: any): boolean {
    if (!e) return true;
    if (e.status) {
      const upper = e.status.toString().toUpperCase().trim();
      if (upper === 'COMPLETED' || upper === 'EVENT COMPLETED' || upper === 'PAST' || upper === 'CANCELLED') {
        return true;
      }
    }
    return this.isEventPast(e.date, e.time, e.endTime);
  }

  private isEventPast(dateStr: string, timeStr?: string, endTimeStr?: string): boolean {
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
}

