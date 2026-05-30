import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EventListItem {
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
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.scss'
})
export class EventsComponent {
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

  events = signal<EventListItem[]>([
    {
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
