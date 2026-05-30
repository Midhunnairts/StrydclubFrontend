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
      status: 'upcoming'
    },
    {
      title: 'Inter-City Badminton Tournament',
      category: 'Badminton',
      date: 'June 2, 2026',
      time: '9:00 AM',
      location: 'Sports Complex, Mumbai',
      status: 'upcoming'
    },
    {
      title: 'Friday Night Football League',
      category: 'Football',
      date: 'May 25, 2026',
      time: '7:00 PM',
      location: 'Green Field Arena, Delhi',
      status: 'upcoming'
    },
    {
      title: 'National Volleyball Championship',
      category: 'Volleyball',
      date: 'June 10, 2026',
      time: '4:00 PM',
      location: 'Indira Gandhi Stadium, Delhi',
      status: 'upcoming'
    },
    {
      title: 'Pickleball Summer Open',
      category: 'Pickleball',
      date: 'June 15, 2026',
      time: '8:00 AM',
      location: 'Ace Tennis Club, Bangalore',
      status: 'upcoming'
    },
    {
      title: 'Pro Kho Kho Tournament',
      category: 'Kho Kho',
      date: 'June 20, 2026',
      time: '5:00 PM',
      location: 'Shivaji Sports Complex, Pune',
      status: 'upcoming'
    },
    {
      title: 'Padel Club Challenge',
      category: 'Padel',
      date: 'June 25, 2026',
      time: '6:00 PM',
      location: 'Padel Arena, Hyderabad',
      status: 'upcoming'
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
}
