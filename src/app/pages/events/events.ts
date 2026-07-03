import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface EventListItem {
  id: string;
  title: string;
  category: string;
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

  categories = [
    'All',
    'Running',
    'Badminton',
    'Football',
    'Volleyball',
    'Pickleball',
    'Kho Kho',
    'Padel'
  ];

  // Initialize events list signal
  events = signal<EventListItem[]>([]);

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const categoryParam = params.get('category');
      if (categoryParam) {
        const matchedCategory = this.categories.find(
          c => c.toLowerCase() === categoryParam.toLowerCase()
        );
        if (matchedCategory) {
          this.selectedCategory.set(matchedCategory);
        }
      } else {
        this.selectedCategory.set('All');
      }
    });
    this.loadEvents();
  }

  loadEvents() {
    this.apiService.getEvents()
      .subscribe({
        next: (res) => {
          if (res.success) {
            // Map Mongoose dynamic event structure
            const mapped = res.events.map(e => ({
              id: (e as any)._id || e.id || (e as any).slug || '',
              title: e.title,
              category: e.category,
              date: e.date,
              time: e.time,
              location: e.location,
              status: e.status,
              slotsFilled: e.slotsFilled,
              slotsTotal: e.slotsTotal
            }));
            this.events.set(mapped);
          }
        },
        error: (err) => {
          console.warn('Backend server offline. Bootstrapping premium events listing fallback...');
          this.events.set([]);
        }
      });
  }

  filteredEvents = computed(() => {
    let list = this.events();

    // Filter by Category
    const category = this.selectedCategory();
    if (category !== 'All') {
      list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
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

  selectCategory(category: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category === 'All' ? null : category },
      queryParamsHandling: 'merge'
    });
  }

  getSlotsPercentage(event: EventListItem): number {
    if (!event.slotsTotal) return 0;
    return (event.slotsFilled / event.slotsTotal) * 100;
  }
}
