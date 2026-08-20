import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface SportItem {
  name: string;
  badge: string;
  image: string;
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

  ]);

  ngOnInit() {
    this.loadSports();
  }

  loadSports() {
    this.apiService.getSports().subscribe({
      next: (res) => {
        console.log(res);

        if (res.success && res.sports) {
          const defaultBadges: Record<string, string> = {
            'Running': 'MOST POPULAR',
            'Badminton': 'INDOOR',
            'Football': 'TEAM SPORT',
            'Volleyball': 'BEACH & INDOOR',
            'Pickleball': 'FAST GROWING',
            'Cricket': 'POPULAR',
            'Kho Kho': 'TRADITIONAL'
          };
          const defaultImages: Record<string, string> = {
            'Running': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
            'Badminton': 'https://images.unsplash.com/photo-1626225967045-94408422615d?auto=format&fit=crop&w=800&q=80',
            'Football': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
            'Volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
            'Pickleball': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
            'Cricket': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
            'Kho Kho': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'
          };
          const mapped = res.sports.map(s => ({
            name: s.name,
            badge: s.badge || defaultBadges[s.name] || 'FEATURED',
            image: s.image || defaultImages[s.name] || 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
            eventsCount: s.eventsCount
          }));
          this.sports.set(mapped);
        }
      },
      error: () => {
        this.sports.set([]);
      }
    });
  }
}

