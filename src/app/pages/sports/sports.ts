import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface NextEventInfo {
  title: string;
  date: string;
  time: string;
  location: string;
}

interface SportPageItem {
  name: string;
  icon: string;
  description: string;
  eventsCount: number;
  membersCount: number;
  nextEvent: NextEventInfo;
}

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sports.html',
  styleUrl: './sports.scss'
})
export class SportsComponent implements OnInit {
  private apiService = inject(ApiService);

  sports = signal<SportPageItem[]>([]);

  ngOnInit() {
    this.loadSports();
  }

  loadSports() {
    this.apiService.getSports().subscribe({
      next: (res) => {
        if (res.success) {
          this.sports.set(res.sports || []);
        }
      },
      error: () => {
        this.sports.set([]);
      }
    });
  }
}
