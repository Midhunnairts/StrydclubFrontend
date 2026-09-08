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
      title: 'Move with Purpose',
      description: "Every experience is designed to inspire an active, fulfilling lifestyle."
    },
    {
      iconName: 'energy',
      title: 'Built on Community',
      description: 'Real connections are at the heart of everything we do.'
    },
    {
      iconName: 'community',
      title: 'Experience More',
      description: 'Thoughtfully curated sports, adventures, and social experiences that bring people together.'
    },
    {
      iconName: 'everyone',
      title: 'Everyone Belongs',
      description: 'No matter your background or skill level, STRYD is a community where everyone can thrive.'
    }
  ]);

  journey = signal<JourneyItem[]>([
    {
      year: '2025',
      title: 'Where It All Began',
      description: "STRYD was founded with a simple idea—to create a community where people could connect through sports, movement, and shared experiences.",
      side: 'left'
    },
    {
      year: '2026',
      title: 'Today Building the Community',
      description: "From runs and racquet sports to fitness sessions and weekend adventures, STRYD continues to bring together a growing community through thoughtfully curated experiences across Chennai.",
      side: 'right'
    },
    {
      year: '2027',
      title: 'The Future Growing Beyond Boundaries',
      description: "Our vision is to make STRYD the go-to lifestyle community for sports, wellness, and experiences expanding into new cities, new activities, and creating even more ways for people to move and connect.",
      side: 'left'
    }
  ]);
}
