import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ValueItem {
  iconName: string;
  title: string;
  description: string;
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
}
