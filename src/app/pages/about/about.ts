import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ValueItem {
  iconName: string;
  title: string;
  description: string;
}

interface JourneyItem {
  year: string;
  title: string;
  description: string;
  side: 'left' | 'right';
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class AboutComponent {
  values = signal<ValueItem[]>([
    {
      iconName: 'mission',
      title: 'Mission Driven',
      description: "Building India's most inclusive and energetic multi-sport community platform."
    },
    {
      iconName: 'energy',
      title: 'High Energy',
      description: 'Every event, every match, every moment designed to fuel your competitive spirit.'
    },
    {
      iconName: 'community',
      title: 'Community First',
      description: 'More than competitions - we create connections that last beyond the finish line.'
    },
    {
      iconName: 'everyone',
      title: 'For Everyone',
      description: 'From beginners to champions, every athlete finds their place in our community.'
    }
  ]);

  journey = signal<JourneyItem[]>([
    {
      year: '2025',
      title: 'The Beginning',
      description: "Founded with a vision to unite India's sports enthusiasts under one platform.",
      side: 'left'
    },
    {
      year: '2026',
      title: 'Rapid Growth',
      description: "Expanded to 24 cities with over 12,500 active members and 850+ events.",
      side: 'right'
    },
    {
      year: '2027',
      title: 'The Future',
      description: "Scaling to 100+ cities, introducing new sports, and building the ultimate sports ecosystem.",
      side: 'left'
    }
  ]);
}
