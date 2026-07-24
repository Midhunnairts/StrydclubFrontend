import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface SportItem {
  name: string;
  icon: string;
  eventsCount: number;
}

@Component({
  selector: 'app-sport-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sport-list.html',
  styleUrl: './sport-list.scss'
})
export class SportListComponent implements OnInit {
  private apiService = inject(ApiService);

  sports = signal<SportItem[]>([
    { name: 'Running', icon: '🏃', eventsCount: 12 },
    { name: 'Badminton', icon: '🏸', eventsCount: 8 },
    { name: 'Kho Kho', icon: '🎯', eventsCount: 5 },
    { name: 'Football', icon: '⚽', eventsCount: 15 },
    { name: 'Volleyball', icon: '🏐', eventsCount: 10 },
    { name: 'Pickleball', icon: '🎾', eventsCount: 6 },
    { name: 'Padel', icon: '🏓', eventsCount: 4 },
    { name: 'Other', icon: '✨', eventsCount: 2 }
  ]);

  ngOnInit() {
    this.loadSports();
  }

  loadSports() {
    this.apiService.getSports().subscribe({
      next: (res) => {
        if (res.success) {
          // Map sports fields
          const mapped = res.sports.map(s => ({
            name: s.name,
            icon: s.icon,
            eventsCount: s.eventsCount
          }));
          this.sports.set(mapped);
        }
      },
      error: (err) => {
        console.warn('Backend server offline. Keeping sports listing fallback...');
      }
    });
  }
}

