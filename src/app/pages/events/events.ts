import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
    const categoryParam = this.route.snapshot.queryParamMap.get('category');
    if (categoryParam) {
      const matchedCategory = this.categories.find(
        c => c.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matchedCategory) {
        this.selectedCategory.set(matchedCategory);
      }
    }
    this.loadEvents();
  }

  loadEvents() {
    this.apiService.getEvents()
      .subscribe({
        next: (res) => {
          if (res.success) {
            // Map Mongoose dynamic event structure
            const mapped = res.events.map(e => ({
              id: e.id || (e as any).slug || '',
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
          this.events.set([
            {
              id: 'weekend-5k-marathon',
              title: 'Weekend 5K Marathon',
              category: 'Running',
              date: 'May 28, 2026',
              time: '6:00 AM',
              location: 'Cubbon Park, Bangalore',
              status: 'upcoming',
              slotsFilled: 45,
              slotsTotal: 100
            },
            {
              id: 'inter-city-badminton-tournament',
              title: 'Inter-City Badminton Tournament',
              category: 'Badminton',
              date: 'June 2, 2026',
              time: '9:00 AM',
              location: 'Sports Complex, Mumbai',
              status: 'upcoming',
              slotsFilled: 12,
              slotsTotal: 32
            },
            {
              id: 'friday-night-football-league',
              title: 'Friday Night Football League',
              category: 'Football',
              date: 'May 25, 2026',
              time: '7:00 PM',
              location: 'Green Field Arena, Delhi',
              status: 'upcoming',
              slotsFilled: 8,
              slotsTotal: 22
            },
            {
              id: 'sunrise-volleyball-championship',
              title: 'Sunrise Volleyball Championship',
              category: 'Volleyball',
              date: 'May 30, 2026',
              time: '5:30 AM',
              location: 'Beach Courts, Goa',
              status: 'upcoming',
              slotsFilled: 10,
              slotsTotal: 30
            },
            {
              id: 'pickleball-pro-league',
              title: 'Pickleball Pro League',
              category: 'Pickleball',
              date: 'June 5, 2026',
              time: '10:00 AM',
              location: 'Indoor Arena, Pune',
              status: 'upcoming',
              slotsFilled: 15,
              slotsTotal: 40
            },
            {
              id: 'traditional-kho-kho-challenge',
              title: 'Traditional Kho Kho Challenge',
              category: 'Kho Kho',
              date: 'June 8, 2026',
              time: '4:00 PM',
              location: 'Stadium, Hyderabad',
              status: 'upcoming',
              slotsFilled: 6,
              slotsTotal: 20
            },
            {
              id: 'padel-club-challenge',
              title: 'Padel Club Challenge',
              category: 'Padel',
              date: 'June 25, 2026',
              time: '6:00 PM',
              location: 'Padel Arena, Hyderabad',
              status: 'upcoming',
              slotsFilled: 10,
              slotsTotal: 20
            }
          ]);
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
    this.selectedCategory.set(category);
  }

  getSlotsPercentage(event: EventListItem): number {
    if (!event.slotsTotal) return 0;
    return (event.slotsFilled / event.slotsTotal) * 100;
  }
}
