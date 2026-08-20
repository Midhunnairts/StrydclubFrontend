import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

export interface EventListItem {
  id: string;
  title: string;
  category: string;
  icon?: string;
  image?: string;
  price?: number;
  date: string;
  time: string;
  location: string;
  status: string;
  slotsFilled: number;
  slotsTotal: number;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.scss'
})
export class EventsComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');
  activeTab = signal<'upcoming' | 'past'>('upcoming');

  categories = [
    { name: 'All', icon: '' },
    { name: 'Running', icon: '🏃' },
    { name: 'Badminton', icon: '🏸' },
    { name: 'Football', icon: '⚽' },
    { name: 'Volleyball', icon: '🏐' },
    { name: 'Pickleball', icon: '🎾' },
    { name: 'Kho Kho', icon: '🏹' },
    { name: 'Padel', icon: '🏓' },
    { name: 'Other', icon: '🎯' }
  ];

  // Initialize events list signal from API
  events = signal<EventListItem[]>([]);

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const categoryParam = params.get('category');
      if (categoryParam) {
        const matchedCategory = this.categories.find(
          c => c.name.toLowerCase() === categoryParam.toLowerCase()
        );
        if (matchedCategory) {
          this.selectedCategory.set(matchedCategory.name);
        }
      } else {
        this.selectedCategory.set('All');
      }
    });
    this.loadEvents();
  }

  loadEvents() {
    this.apiService.getEvents().subscribe({
      next: (res) => {
        if (res.success && res.events) {
          const categoryIcons: Record<string, string> = {
            'Running': '🏃',
            'Badminton': '🏸',
            'Football': '⚽',
            'Volleyball': '🏐',
            'Pickleball': '🎾',
            'Kho Kho': '🏹',
            'Padel': '🏓',
            'Other': '🎯'
          };
          const categoryImages: Record<string, string> = {
            'Running': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
            'Badminton': 'https://images.unsplash.com/photo-1626225967045-94408422615d?auto=format&fit=crop&w=800&q=80',
            'Football': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
            'Volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
            'Pickleball': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
            'Kho Kho': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'
          };
          const mapped = res.events.map(e => {
            const slotsTotal = e.slotsTotal || 50;
            const slotsFilled = e.slotsFilled || 0;
            const fillPercentage = (slotsFilled / slotsTotal) * 100;
            let computedStatus = e.status || 'OPEN';
            
            const isPast = computedStatus.toUpperCase() === 'COMPLETED' || this.isEventPast(e.date);
            if (isPast) {
              computedStatus = 'COMPLETED';
            } else if (fillPercentage > 50) {
              computedStatus = 'FILLING FAST';
            } else {
              computedStatus = 'OPEN';
            }

            return {
              id: (e as any)._id || e.id || (e as any).slug || '',
              title: e.title,
              category: e.category,
              icon: categoryIcons[e.category] || '🎯',
              image: e.bannerUrl || e.image || categoryImages[e.category] || 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
              price: e.price || 499,
              date: e.date,
              time: e.time,
              location: e.location,
              status: computedStatus.toUpperCase(),
              slotsFilled,
              slotsTotal
            };
          });
          this.events.set(mapped);
        }
      },
      error: (err) => {
        console.error('Error fetching events:', err);
        this.events.set([]);
      }
    });
  }

  filteredEvents = computed(() => {
    let list = this.events();

    // Filter by Active Tab (Upcoming vs Past)
    const tab = this.activeTab();
    list = list.filter(e => {
      const isPast = e.status === 'COMPLETED' || e.status === 'Completed' || e.status === 'completed' || this.isEventPast(e.date);
      return tab === 'past' ? isPast : !isPast;
    });

    // Filter by Category
    const category = this.selectedCategory();
    if (category !== 'All') {
      if (category.toLowerCase() === 'other') {
        const standardCategories = ['running', 'badminton', 'football', 'volleyball', 'pickleball', 'kho kho', 'padel'];
        list = list.filter(e => !standardCategories.includes(e.category.toLowerCase()) || e.category.toLowerCase() === 'other');
      } else {
        list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
      }
    }

    // Filter by Search Query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
      );
    }

    return list;
  });

  isEventPast(dateStr: string): boolean {
    if (!dateStr) return false;
    const eventDate = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return !isNaN(eventDate.getTime()) && eventDate < now;
  }

  isUpcomingEvent(event: EventListItem): boolean {
    if (event.status) {
      const upper = event.status.toUpperCase();
      if (upper === 'COMPLETED' || upper === 'EVENT COMPLETED' || upper === 'PAST') {
        return false;
      }
    }
    return !this.isEventPast(event.date);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category === 'All' ? null : category },
      queryParamsHandling: 'merge'
    });
  }

  getSlotsLeftCount(event: EventListItem): number {
    return Math.max(0, (event.slotsTotal || 0) - (event.slotsFilled || 0));
  }

  getSlotsPercentage(event: EventListItem): number {
    if (!event.slotsTotal) return 0;
    return Math.min(100, ((event.slotsFilled || 0) / event.slotsTotal) * 100);
  }

  getEventIcon(event: EventListItem): string {
    if (event.icon) return event.icon;
    const icons: Record<string, string> = {
      'Running': '🏃',
      'Badminton': '🏸',
      'Football': '⚽',
      'Volleyball': '🏐',
      'Pickleball': '🎾',
      'Kho Kho': '🏹'
    };
    return icons[event.category] || '✨';
  }

  getEventImage(event: EventListItem): string {
    if (event.image) return event.image;
    const defaultImages: Record<string, string> = {
      'Running': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
      'Badminton': 'https://images.unsplash.com/photo-1626225967045-94408422615d?auto=format&fit=crop&w=800&q=80',
      'Football': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      'Volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
      'Pickleball': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
      'Kho Kho': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'
    };
    return defaultImages[event.category] || 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80';
  }

  getEventPrice(event: EventListItem): number | null {
    if (event.price) return event.price;
    const defaultPrices: Record<string, number> = {
      'Running': 499,
      'Badminton': 799,
      'Football': 599,
      'Volleyball': 399,
      'Pickleball': 649,
      'Kho Kho': 299
    };
    return defaultPrices[event.category] || 499;
  }

  getEventStatus(event: EventListItem): string {
    if (!this.isUpcomingEvent(event)) {
      return 'COMPLETED';
    }
    const fillPercentage = this.getSlotsPercentage(event);
    return fillPercentage > 50 ? 'FILLING FAST' : 'OPEN';
  }

  hasCategoryPill(event: EventListItem): boolean {
    return event.category === 'Volleyball' || event.category === 'Pickleball' || event.category === 'Kho Kho' || !!event.icon;
  }
}
