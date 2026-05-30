import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EventItem {
  title: string;
  category: string;
  date: string;
  location: string;
  slotsFilled: number;
  slotsTotal: number;
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss'
})
export class EventListComponent {
  events = signal<EventItem[]>([
    {
      title: 'Weekend 5K Marathon',
      category: 'Running',
      date: 'May 28, 2026 • 6:00 AM',
      location: 'Cubbon Park, Bangalore',
      slotsFilled: 45,
      slotsTotal: 100
    },
    {
      title: 'Inter-City Badminton Tournament',
      category: 'Badminton',
      date: 'June 2, 2026 • 9:00 AM',
      location: 'Sports Complex, Mumbai',
      slotsFilled: 12,
      slotsTotal: 32
    },
    {
      title: 'Friday Night Football League',
      category: 'Football',
      date: 'May 25, 2026 • 7:00 PM',
      location: 'Green Field Arena, Delhi',
      slotsFilled: 8,
      slotsTotal: 22
    }
  ]);

  getSlotsPercentage(event: EventItem): number {
    if (event.slotsTotal === 0) return 0;
    return (event.slotsFilled / event.slotsTotal) * 100;
  }
}
