import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface StatItem {
  value: string;
  label: string;
  iconName: string;
}

interface TestimonialItem {
  quote: string;
  name: string;
  sport: string;
  avatar: string;
}

@Component({
  selector: 'app-community-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './community-home.html',
  styleUrl: './community-home.scss'
})
export class CommunityHomeComponent {
  stats = signal<StatItem[]>([
    {
      value: '12,500+',
      label: 'Active Members',
      iconName: 'members'
    },
    {
      value: '24',
      label: 'Cities',
      iconName: 'cities'
    },
    {
      value: '850+',
      label: 'Events Hosted',
      iconName: 'events'
    }
  ]);

  testimonials = signal<TestimonialItem[]>([
    {
      quote: '"Found my running crew here. 3 marathons later and I\'m still going strong!"',
      name: 'Kavya R.',
      sport: 'Running',
      avatar: 'KR'
    },
    {
      quote: '"Best platform to find competitive badminton matches in Bangalore."',
      name: 'Arjun S.',
      sport: 'Badminton',
      avatar: 'AS'
    },
    {
      quote: '"Organised 4 football leagues through Strydclub. Seamless every time."',
      name: 'Priya M.',
      sport: 'Football',
      avatar: 'PM'
    }
  ]);

  get isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('token');
    }
    return false;
  }
}
