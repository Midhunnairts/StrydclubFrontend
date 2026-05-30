import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SportItem {
  name: string;
  icon: string;
  eventsCount: number;
}

@Component({
  selector: 'app-sport-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sport-list.html',
  styleUrl: './sport-list.scss'
})
export class SportListComponent {
  sports = signal<SportItem[]>([
    { name: 'Running', icon: '🏃', eventsCount: 12 },
    { name: 'Badminton', icon: '🏸', eventsCount: 8 },
    { name: 'Kho Kho', icon: '🎯', eventsCount: 5 },
    { name: 'Football', icon: '⚽', eventsCount: 15 },
    { name: 'Volleyball', icon: '🏐', eventsCount: 10 },
    { name: 'Pickleball', icon: '🎾', eventsCount: 6 },
    { name: 'Padel', icon: '🏓', eventsCount: 4 }
  ]);
}
