import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface UserProfileDetails {
  name: string;
  avatarUrl?: string;
  favoriteSports: string[];
  memberSince: string;
  totalEvents: number;
  eventsWon: number;
  sportsPlayed: number;
  initials: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  userProfile = signal<UserProfileDetails | null>(null);
  loading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id === 'mock') {
        this.loadMockProfile();
      } else {
        this.loadRealProfile(id);
      }
    });
  }

  loadRealProfile(id: string) {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.apiService.getPublicUserProfile(id).subscribe({
      next: (res) => {
        if (res.success && res.user) {
          const user = res.user;
          const initials = user.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          this.userProfile.set({
            name: user.name,
            avatarUrl: user.avatarUrl,
            favoriteSports: user.favoriteSports || [],
            memberSince: user.memberSince || 'January 2026',
            totalEvents: user.totalEvents || 0,
            eventsWon: user.eventsWon || 0,
            sportsPlayed: user.sportsPlayed || 0,
            initials: initials
          });
        } else {
          this.errorMsg.set('User not found');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching public user profile:', err);
        this.errorMsg.set('Failed to load user profile. Make sure the backend server is active.');
        this.loading.set(false);
      }
    });
  }

  loadMockProfile() {
    this.route.queryParams.subscribe(params => {
      const name = params['name'] || 'Community Athlete';
      const sport = params['sport'] || 'Running';
      const events = parseInt(params['events']) || 12;
      const wins = parseInt(params['wins']) || 3;
      
      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      this.userProfile.set({
        name: name,
        favoriteSports: [sport],
        memberSince: 'January 2026',
        totalEvents: events,
        eventsWon: wins,
        sportsPlayed: 1,
        initials: initials
      });
      this.loading.set(false);
    });
  }
}
