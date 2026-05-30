import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatItem {
  value: string;
  label: string;
  iconName: string;
}

@Component({
  selector: 'app-community-home',
  standalone: true,
  imports: [CommonModule],
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
    },
    {
      value: '2,400+',
      label: 'Champions',
      iconName: 'champions'
    }
  ]);
}
